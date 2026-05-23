-- Add premium subscription fields to organizations.
ALTER TABLE "Organization"
ADD COLUMN "isPremium" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "premiumSince" TIMESTAMP(3),
ADD COLUMN "premiumExpiresAt" TIMESTAMP(3),
ADD COLUMN "boldTransactionId" TEXT;

-- Track Bold checkout attempts and webhook confirmations idempotently.
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'approved', 'rejected', 'expired', 'failed');

CREATE TABLE "Payment" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "userEmail" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "provider" TEXT NOT NULL DEFAULT 'bold',
  "amount" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'COP',
  "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
  "description" TEXT NOT NULL,
  "boldTransactionId" TEXT,
  "boldPaymentId" TEXT,
  "failureReason" TEXT,
  "metadata" JSONB DEFAULT '{}',
  "rawPayload" JSONB DEFAULT '{}',
  "paidAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Payment_orderId_key" ON "Payment"("orderId");
CREATE INDEX "Payment_organizationId_status_createdAt_idx" ON "Payment"("organizationId", "status", "createdAt");
CREATE INDEX "Payment_boldTransactionId_idx" ON "Payment"("boldTransactionId");
CREATE INDEX "Payment_boldPaymentId_idx" ON "Payment"("boldPaymentId");

ALTER TABLE "Payment"
ADD CONSTRAINT "Payment_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
