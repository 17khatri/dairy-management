CREATE TYPE "PaymentSchedule" AS ENUM ('NEXT_DAY', 'WEEKLY');

CREATE TYPE "PaymentWeekday" AS ENUM (
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY'
);

ALTER TABLE "Supplier"
ADD COLUMN "paymentSchedule" "PaymentSchedule" NOT NULL DEFAULT 'NEXT_DAY',
ADD COLUMN "weeklyPaymentDay" "PaymentWeekday";

ALTER TABLE "MilkEntry"
ADD COLUMN "paidAt" TIMESTAMP(3);
