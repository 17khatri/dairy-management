CREATE TYPE "PaymentSchedule_new" AS ENUM ('DAILY', 'TEN_DAYS');

ALTER TABLE "Supplier" ALTER COLUMN "paymentSchedule" DROP DEFAULT;

ALTER TABLE "Supplier"
ALTER COLUMN "paymentSchedule" TYPE "PaymentSchedule_new"
USING (
  CASE
    WHEN "paymentSchedule"::text = 'NEXT_DAY' THEN 'DAILY'::"PaymentSchedule_new"
    ELSE 'TEN_DAYS'::"PaymentSchedule_new"
  END
);

DROP TYPE "PaymentSchedule";

ALTER TYPE "PaymentSchedule_new" RENAME TO "PaymentSchedule";

ALTER TABLE "Supplier" ALTER COLUMN "paymentSchedule" SET DEFAULT 'DAILY';

ALTER TABLE "Supplier" DROP COLUMN "weeklyPaymentDay";

DROP TYPE "PaymentWeekday";
