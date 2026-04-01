import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return NextResponse.json({ message: "User Not Found" }, { status: 404 });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const resetOtpExpiry = new Date(Date.now() + 5 * 60 * 1000);

        await prisma.user.update({
            where: { email },
            data: {
                resetOtp: otp,
                resetOtpExpiry: resetOtpExpiry
            },
        });

        console.log("==================================================");
        console.log(`📧 MOCK EMAIL TO: ${email}`);
        console.log(`🔑 YOUR OTP CODE IS: ${otp}`);
        console.log("==================================================");

        return NextResponse.json({ message: "OTP sent successfully to your email." });
    } catch (error) {
        console.error("OTP send error:", error);
        return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
    }
}