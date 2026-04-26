ALTER TABLE "MilkEntry" ADD COLUMN "paymentSchedule" "PaymentSchedule";

UPDATE "MilkEntry"
SET "paymentSchedule" = "Supplier"."paymentSchedule"
FROM "Supplier"
WHERE "MilkEntry"."supplierId" = "Supplier"."id";

ALTER TABLE "MilkEntry" ALTER COLUMN "paymentSchedule" SET NOT NULL;
