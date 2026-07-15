import type { Metadata } from "next";
import { PricingPage } from "@/features/billing/pricing-page";
export const metadata: Metadata = { title: "会员套餐", description: "矿业智工平台免费、专业、团队和企业套餐。" };
export default function Page(){ return <PricingPage />; }
