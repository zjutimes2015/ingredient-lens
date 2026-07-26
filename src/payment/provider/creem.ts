import { randomUUID } from 'crypto';
import { websiteConfig } from '@/config/website';
import {
  addCredits,
  addLifetimeMonthlyCredits,
  addSubscriptionCredits,
} from '@/credits/credits';
import { getCreditPackageById } from '@/credits/server';
import { CREDIT_TRANSACTION_TYPE } from '@/credits/types';
import { getDb } from '@/db';
import { payment, user } from '@/db/schema';
import type { Payment } from '@/db/types';
import {
  PAYMENT_RECORD_RETRY_ATTEMPTS,
  PAYMENT_RECORD_RETRY_DELAY,
} from '@/lib/constants';
import { findPlanByPlanId, findPriceInPlan } from '@/lib/price-plan';
import { sendNotification } from '@/notification/notification';
import { desc, eq } from 'drizzle-orm';
import {
  type CheckoutResult,
  type CreateCheckoutParams,
  type CreateCreditCheckoutParams,
  type CreatePortalParams,
  type PaymentProvider,
  PaymentScenes,
  type PaymentStatus,
  PaymentTypes,
  type PlanInterval,
  PlanIntervals,
  type PortalResult,
} from '../types';

const CREEM_API_URL = 'https://api.creem.io/v1';

/**
 * Creem payment provider implementation
 *
 * docs:
 * https://creem.io/docs
 */
export class CreemProvider implements PaymentProvider {
  private apiKey: string;
  private webhookSecret: string;

  /**
   * Initialize Creem provider with API key
   */
  constructor() {
    const apiKey = process.env.CREEM_API_KEY;
    if (!apiKey) {
      throw new Error('CREEM_API_KEY environment variable is not set');
    }

    const webhookSecret = process.env.CREEM_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('CREEM_WEBHOOK_SECRET environment variable is not set.');
    }

    this.apiKey = apiKey;
    this.webhookSecret = webhookSecret;
  }

  /**
   * Make a request to the Creem API
   */
  private async apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${CREEM_API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Creem API error:', response.status, errorBody);
      throw new Error(
        `Creem API error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Create a customer in Creem if not exists
   */
  private async createOrGetCustomer(
    email: string,
    name?: string
  ): Promise<string> {
    try {
      // Update user record with Creem customer ID if email matches
      // For Creem, we generate a customer reference using the email
      const db = await getDb();
      const result = await db
        .select({ id: user.id, customerId: user.customerId })
        .from(user)
        .where(eq(user.email, email))
        .limit(1);

      if (result.length > 0 && result[0].customerId) {
        return result[0].customerId;
      }

      // Create customer in Creem
      const customer = await this.apiRequest<{ id: string }>('/customers', {
        method: 'POST',
        body: JSON.stringify({
          email,
          name: name || email,
        }),
      });

      // Save customer ID
      await db
        .update(user)
        .set({
          customerId: customer.id,
          updatedAt: new Date(),
        })
        .where(eq(user.email, email));

      return customer.id;
    } catch (error) {
      console.error('Create or get customer error:', error);
      throw new Error('Failed to create or get customer');
    }
  }

  /**
   * Find user ID by customer ID
   */
  private async findUserIdByCustomerId(
    customerId: string
  ): Promise<string | undefined> {
    try {
      const db = await getDb();
      const result = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.customerId, customerId))
        .limit(1);

      if (result.length > 0) {
        return result[0].id;
      }

      return undefined;
    } catch (error) {
      console.error('Find user by customer ID error:', error);
      return undefined;
    }
  }

  /**
   * Create a checkout session for a plan
   */
  public async createCheckout(
    params: CreateCheckoutParams
  ): Promise<CheckoutResult> {
    const {
      planId,
      priceId,
      customerEmail,
      successUrl,
      cancelUrl,
      metadata,
      locale,
    } = params;

    try {
      // Get plan and price
      const plan = findPlanByPlanId(planId);
      if (!plan) {
        throw new Error(`Plan with ID ${planId} not found`);
      }

      const price = findPriceInPlan(planId, priceId);
      if (!price) {
        throw new Error(`Price ID ${priceId} not found in plan ${planId}`);
      }

      // Get userName from metadata if available
      const userName = metadata?.userName;

      // Create or get customer
      const customerId = await this.createOrGetCustomer(
        customerEmail,
        userName
      );

      // Add planId and priceId to metadata
      const customMetadata = {
        ...metadata,
        planId,
        priceId,
      };

      // Determine mode
      const isSubscription = price.type === PaymentTypes.SUBSCRIPTION;

      // Create checkout session via Creem
      const session = await this.apiRequest<{ url: string; id: string }>(
        '/checkout-sessions',
        {
          method: 'POST',
          body: JSON.stringify({
            product_id: priceId,
            success_url: successUrl ?? '',
            cancel_url: cancelUrl ?? '',
            customer_email: customerEmail,
            customer_id: customerId,
            metadata: customMetadata,
            mode: isSubscription ? 'subscription' : 'payment',
            ...(isSubscription && price.trialPeriodDays
              ? { trial_period_days: price.trialPeriodDays }
              : {}),
          }),
        }
      );

      return {
        url: session.url,
        id: session.id,
      };
    } catch (error) {
      console.error('Create checkout session error:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  /**
   * Create a checkout session for a credit package
   */
  public async createCreditCheckout(
    params: CreateCreditCheckoutParams
  ): Promise<CheckoutResult> {
    const { packageId, customerEmail, successUrl, cancelUrl, metadata, locale } =
      params;

    try {
      // Get credit package
      const creditPackage = getCreditPackageById(packageId);
      if (!creditPackage) {
        throw new Error(`Credit package with ID ${packageId} not found`);
      }

      // Get priceId from credit package
      const priceId = creditPackage.price.priceId;
      if (!priceId) {
        throw new Error(`Price ID not found for credit package ${packageId}`);
      }

      // Get userName from metadata if available
      const userName = metadata?.userName;

      // Create or get customer
      const customerId = await this.createOrGetCustomer(
        customerEmail,
        userName
      );

      // Add metadata
      const customMetadata = {
        ...metadata,
        packageId,
        priceId,
      };

      // Create checkout session via Creem
      const session = await this.apiRequest<{ url: string; id: string }>(
        '/checkout-sessions',
        {
          method: 'POST',
          body: JSON.stringify({
            product_id: priceId,
            success_url: successUrl ?? '',
            cancel_url: cancelUrl ?? '',
            customer_email: customerEmail,
            customer_id: customerId,
            metadata: customMetadata,
            mode: 'payment',
          }),
        }
      );

      return {
        url: session.url,
        id: session.id,
      };
    } catch (error) {
      console.error('Create credit checkout session error:', error);
      throw new Error('Failed to create credit checkout session');
    }
  }

  /**
   * Create a customer portal session
   */
  public async createCustomerPortal(
    params: CreatePortalParams
  ): Promise<PortalResult> {
    const { customerId, returnUrl, locale } = params;

    try {
      const session = await this.apiRequest<{ url: string }>(
        '/customers/portal',
        {
          method: 'POST',
          body: JSON.stringify({
            customer_id: customerId,
            return_url: returnUrl ?? '',
          }),
        }
      );

      return {
        url: session.url,
      };
    } catch (error) {
      console.error('Create customer portal error:', error);
      throw new Error('Failed to create customer portal');
    }
  }

  /**
   * Handle webhook event
   */
  public async handleWebhookEvent(
    payload: string,
    signature: string
  ): Promise<void> {
    try {
      // Verify webhook signature
      // Creem sends signature in x-creem-signature header
      const isValid = this.verifySignature(payload, signature);
      if (!isValid) {
        throw new Error('Invalid webhook signature');
      }

      const event = JSON.parse(payload);
      const eventType = event.type;
      console.log(`handle webhook event, type: ${eventType}`);

      // Handle checkout session completed
      if (eventType === 'checkout.session.completed') {
        const session = event.data;
        await this.onCheckoutCompleted(session);
      }
      // Handle subscription events
      else if (eventType.startsWith('subscription.')) {
        const subscription = event.data;
        switch (eventType) {
          case 'subscription.created': {
            await this.onCreateSubscription(subscription);
            break;
          }
          case 'subscription.updated': {
            await this.onUpdateSubscription(subscription);
            break;
          }
          case 'subscription.deleted': {
            await this.onDeleteSubscription(subscription);
            break;
          }
        }
      }
      // Handle invoice events
      else if (eventType.startsWith('invoice.')) {
        switch (eventType) {
          case 'invoice.paid': {
            const invoice = event.data;
            await this.onInvoicePaid(invoice);
            break;
          }
        }
      }
    } catch (error) {
      console.error('handle webhook event error:', error);
      throw new Error('Failed to handle webhook event');
    }
  }

  /**
   * Verify Creem webhook signature
   */
  private verifySignature(payload: string, signature: string): boolean {
    try {
      // Creem uses HMAC-SHA256 to sign webhook payloads
      // The signature is in the x-creem-signature header
      const crypto = require('crypto');
      const hmac = crypto.createHmac('sha256', this.webhookSecret);
      hmac.update(payload);
      const expectedSignature = hmac.digest('hex');
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  /**
   * Find payment record by various identifiers
   */
  private async findPaymentRecord(
    invoice: any
  ): Promise<Payment | null> {
    try {
      const db = await getDb();

      // Strategy 1: Find by invoice ID
      if (invoice.id) {
        const paymentsByInvoice = await db
          .select()
          .from(payment)
          .where(eq(payment.invoiceId, invoice.id))
          .orderBy(desc(payment.createdAt))
          .limit(1);

        if (paymentsByInvoice.length > 0) {
          console.log('Found payment record by invoice ID');
          return paymentsByInvoice[0];
        }
      }

      // Strategy 2: Find by subscription ID
      const subscriptionId = invoice.subscription;
      if (subscriptionId) {
        const paymentsBySubscription = await db
          .select()
          .from(payment)
          .where(eq(payment.subscriptionId, subscriptionId))
          .orderBy(desc(payment.createdAt))
          .limit(1);

        if (paymentsBySubscription.length > 0) {
          console.log('Found payment record by subscription ID');
          return paymentsBySubscription[0];
        }
      }

      console.warn('No payment record found for invoice:', invoice.id);
      return null;
    } catch (error) {
      console.error('Find payment record error:', error);
      return null;
    }
  }

  /**
   * Find payment record with retry mechanism
   */
  private async findPaymentRecordWithRetry(
    invoice: any
  ): Promise<Payment | null> {
    console.log(`>> Find payment record for invoice: ${invoice.id}`);

    for (let attempt = 1; attempt <= PAYMENT_RECORD_RETRY_ATTEMPTS; attempt++) {
      const paymentRecord = await this.findPaymentRecord(invoice);

      if (paymentRecord) {
        console.log(`<< Found payment record on attempt ${attempt}`);
        return paymentRecord;
      }

      if (attempt < PAYMENT_RECORD_RETRY_ATTEMPTS) {
        console.log(
          `Payment record not found, retry in ${PAYMENT_RECORD_RETRY_DELAY}ms`
        );
        await new Promise((resolve) =>
          setTimeout(resolve, PAYMENT_RECORD_RETRY_DELAY)
        );
      }
    }

    console.error('<< Payment record not found after all attempts');
    return null;
  }

  /**
   * Handle checkout session completion
   */
  private async onCheckoutCompleted(session: any): Promise<void> {
    console.log('>> Handle checkout session completion:', session.id);

    try {
      if (session.mode === 'subscription') {
        await this.createSubscriptionPaymentRecord(session);
      } else if (session.mode === 'payment') {
        await this.createOneTimePaymentRecord(session);
      } else {
        console.warn('<< Unsupported checkout session mode:', session.mode);
        return;
      }
    } catch (error) {
      console.error('<< Handle checkout session completion error:', error);
      throw error;
    }

    console.log('<< Handle checkout session completion success');
  }

  /**
   * Create subscription payment record
   */
  private async createSubscriptionPaymentRecord(
    session: any
  ): Promise<void> {
    console.log('>> Create subscription payment record');

    if (!session.subscription) {
      console.warn('<< No subscription found in session');
      return;
    }

    const subscriptionId = session.subscription;
    const priceId = session.metadata?.priceId;
    if (!priceId) {
      console.warn('<< No priceId found in session metadata');
      return;
    }

    const currentDate = new Date();
    const userId = session.metadata?.userId;
    const customerId = session.customer_id || session.customer;

    if (!userId) {
      console.warn('<< No userId in session metadata');
      return;
    }

    const invoiceId = session.invoice || null;

    // Create subscription payment record
    const db = await getDb();

    try {
      await db.insert(payment).values({
        id: randomUUID(),
        priceId,
        type: PaymentTypes.SUBSCRIPTION,
        scene: PaymentScenes.SUBSCRIPTION,
        userId,
        customerId,
        subscriptionId,
        sessionId: session.id,
        invoiceId,
        paid: false,
        interval: PlanIntervals.MONTH,
        status: 'active',
        createdAt: currentDate,
        updatedAt: currentDate,
      });

      console.log('<< Created subscription payment record success');
    } catch (error: any) {
      if (
        error instanceof Error &&
        error.message.includes('unique constraint')
      ) {
        console.log('<< Payment record already exists, skipping creation');
        return;
      }
      throw error;
    }
  }

  /**
   * Create one-time payment record
   */
  private async createOneTimePaymentRecord(
    session: any
  ): Promise<void> {
    console.log('>> Create one-time payment record');

    const priceId = session.metadata?.priceId;
    if (!priceId) {
      console.warn('<< No priceId found in session metadata');
      return;
    }

    const currentDate = new Date();
    const userId = session.metadata?.userId;
    const customerId = session.customer_id || session.customer;

    if (!userId) {
      console.warn('<< No userId in session metadata');
      return;
    }

    const invoiceId = session.invoice || null;

    // Determine payment scene
    const metadata = session.metadata || {};
    const isCreditPurchase = metadata.type === 'credit_purchase';
    const scene = isCreditPurchase
      ? PaymentScenes.CREDIT
      : PaymentScenes.LIFETIME;

    const db = await getDb();

    try {
      await db.insert(payment).values({
        id: randomUUID(),
        priceId,
        type: PaymentTypes.ONE_TIME,
        scene,
        userId,
        customerId,
        sessionId: session.id,
        invoiceId,
        paid: false,
        status: 'completed',
        createdAt: currentDate,
        updatedAt: currentDate,
      });

      console.log('<< Created one-time payment record success');
    } catch (error: any) {
      if (
        error instanceof Error &&
        error.message.includes('unique constraint')
      ) {
        console.log('<< Payment record already exists, skipping creation');
        return;
      }
      throw error;
    }
  }

  /**
   * Handle invoice paid
   */
  private async onInvoicePaid(invoice: any): Promise<void> {
    console.log('>> Handle invoice paid, invoiceId:', invoice.id);

    try {
      const paymentRecord = await this.findPaymentRecordWithRetry(invoice);
      if (!paymentRecord) {
        console.error('<< Payment record not found for invoice:', invoice.id);
        throw new Error(`Payment record not found for invoice: ${invoice.id}`);
      }

      const isSubscriptionPayment =
        paymentRecord.type === PaymentTypes.SUBSCRIPTION;

      if (isSubscriptionPayment) {
        await this.updateSubscriptionPayment(invoice, paymentRecord);
      } else {
        await this.updateOneTimePayment(invoice, paymentRecord);
      }
    } catch (error: any) {
      console.error('<< Handle invoice paid error:', error);

      if (
        error instanceof Error &&
        error.message.includes('unique constraint')
      ) {
        console.log('<< Invoice already processed:', invoice.id);
        return;
      }

      throw error;
    }

    console.log('<< Handle invoice paid success');
  }

  /**
   * Update subscription payment record
   */
  private async updateSubscriptionPayment(
    invoice: any,
    paymentRecord: Payment
  ): Promise<void> {
    console.log('>> Update subscription payment record');

    try {
      let subscriptionId = invoice.subscription || null;

      if (!subscriptionId && paymentRecord.subscriptionId) {
        subscriptionId = paymentRecord.subscriptionId;
      }

      if (!subscriptionId) {
        console.warn('<< No subscriptionId found');
        return;
      }

      // Fetch subscription details from Creem
      const subscription = await this.apiRequest<any>(
        `/subscriptions/${subscriptionId}`
      );

      const priceId = subscription.items?.[0]?.price?.id || paymentRecord.priceId;
      const customerId = subscription.customer_id || subscription.customer;
      const userId = subscription.metadata?.userId;
      const periodStart = subscription.current_period_start
        ? new Date(subscription.current_period_start * 1000)
        : undefined;
      const periodEnd = subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : undefined;

      const db = await getDb();

      let resolvedUserId = userId;
      if (!resolvedUserId) {
        resolvedUserId = await this.findUserIdByCustomerId(customerId);
      }

      if (!resolvedUserId) {
        console.error('<< No userId found');
        return;
      }

      await db
        .update(payment)
        .set({
          paid: true,
          status: this.mapCreemStatusToPaymentStatus(subscription.status),
          periodStart,
          periodEnd,
          updatedAt: new Date(),
        })
        .where(eq(payment.id, paymentRecord.id));

      // Process subscription benefits
      await this.processSubscriptionPurchase(resolvedUserId, priceId);
    } catch (error) {
      console.error('<< Update subscription payment error:', error);
      throw error;
    }

    console.log('<< Update subscription payment record success');
  }

  /**
   * Process subscription purchase
   */
  private async processSubscriptionPurchase(
    userId: string,
    priceId: string
  ): Promise<void> {
    console.log('>> Process subscription purchase');

    if (websiteConfig.credits?.enableCredits) {
      await addSubscriptionCredits(userId, priceId);
      console.log('Added subscription credits for user:', userId);
    }

    console.log('<< Process subscription purchase success');
  }

  /**
   * Update one-time payment record
   */
  private async updateOneTimePayment(
    invoice: any,
    paymentRecord: Payment
  ): Promise<void> {
    console.log('>> Update one-time payment record');

    try {
      const db = await getDb();
      await db
        .update(payment)
        .set({
          status: 'completed',
          paid: true,
          updatedAt: new Date(),
        })
        .where(eq(payment.id, paymentRecord.id));

      // Process benefits based on payment type
      if (paymentRecord.sessionId) {
        const session = await this.apiRequest<any>(
          `/checkout-sessions/${paymentRecord.sessionId}`
        );
        const metadata = session.metadata || {};
        const isCreditPurchase = metadata.type === 'credit_purchase';

        if (isCreditPurchase) {
          await this.processCreditPurchase(invoice, paymentRecord, metadata);
        } else {
          await this.processLifetimePlanPurchase(invoice, paymentRecord);
        }
      }
    } catch (error) {
      console.error('<< Update one-time payment error:', error);
      throw error;
    }

    console.log('<< Update one-time payment record success');
  }

  /**
   * Process credit purchase
   */
  private async processCreditPurchase(
    invoice: any,
    paymentRecord: Payment,
    metadata: { [key: string]: string }
  ): Promise<void> {
    console.log('>> Process credit purchase');

    const packageId = metadata.packageId;
    const credits = metadata.credits;

    if (!packageId || !credits) {
      console.warn('<< Missing packageId or credits in metadata');
      return;
    }

    const creditPackage = getCreditPackageById(packageId);
    if (!creditPackage) {
      console.warn('<< Credit package not found:', packageId);
      return;
    }

    const amount = invoice.amount_paid ? invoice.amount_paid / 100 : 0;
    await addCredits({
      userId: paymentRecord.userId,
      amount: Number.parseInt(credits),
      type: CREDIT_TRANSACTION_TYPE.PURCHASE_PACKAGE,
      description: `+${credits} credits for package ${packageId} ($${amount.toLocaleString()})`,
      paymentId: invoice.id,
      expireDays: creditPackage.expireDays,
    });

    console.log('<< Process credit purchase success');
  }

  /**
   * Process lifetime plan purchase
   */
  private async processLifetimePlanPurchase(
    invoice: any,
    paymentRecord: Payment
  ): Promise<void> {
    console.log('>> Process lifetime plan purchase');

    if (websiteConfig.credits?.enableCredits) {
      await addLifetimeMonthlyCredits(
        paymentRecord.userId,
        paymentRecord.priceId
      );
      console.log('Added lifetime credits for user:', paymentRecord.userId);
    }

    const amount = invoice.amount_paid ? invoice.amount_paid / 100 : 0;
    await sendNotification(
      invoice.id,
      paymentRecord.customerId,
      paymentRecord.userId,
      amount
    );

    console.log('<< Process lifetime plan purchase success');
  }

  /**
   * Handle subscription creation
   */
  private async onCreateSubscription(subscription: any): Promise<void> {
    console.log('Handle subscription creation:', subscription.id);
  }

  /**
   * Update payment record when subscription is updated
   */
  private async onUpdateSubscription(subscription: any): Promise<void> {
    console.log('>> Handle subscription update:', subscription.id);

    const priceId = subscription.items?.[0]?.price?.id;
    if (!priceId) {
      console.warn('<< No priceId found for subscription');
      return;
    }

    const updateFields: any = {
      priceId,
      status: this.mapCreemStatusToPaymentStatus(subscription.status),
      cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
      updatedAt: new Date(),
    };

    if (subscription.current_period_start) {
      updateFields.periodStart = new Date(subscription.current_period_start * 1000);
    }
    if (subscription.current_period_end) {
      updateFields.periodEnd = new Date(subscription.current_period_end * 1000);
    }

    const db = await getDb();
    await db
      .update(payment)
      .set(updateFields)
      .where(eq(payment.subscriptionId, subscription.id));

    console.log('<< Updated payment record for subscription');
  }

  /**
   * Handle subscription deletion
   */
  private async onDeleteSubscription(subscription: any): Promise<void> {
    console.log('>> Handle subscription deletion:', subscription.id);

    const db = await getDb();
    await db
      .update(payment)
      .set({
        status: 'canceled',
        updatedAt: new Date(),
      })
      .where(eq(payment.subscriptionId, subscription.id));

    console.log('<< Marked payment record for subscription as canceled');
  }

  /**
   * Map Creem status to PaymentStatus
   */
  private mapCreemStatusToPaymentStatus(
    status: string
  ): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      active: 'active',
      canceled: 'canceled',
      incomplete: 'incomplete',
      past_due: 'past_due',
      trialing: 'trialing',
      unpaid: 'unpaid',
      paused: 'paused',
    };

    return statusMap[status] || 'failed';
  }
}
