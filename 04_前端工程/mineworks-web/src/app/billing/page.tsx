import type { Metadata } from "next";
import { BillingPage } from "@/features/billing/billing-page";
export const metadata: Metadata = { title: "订阅与用量", description: "查看当前权益、使用配额、订单和订阅。" };
export default function Page(){ return <BillingPage />; }
