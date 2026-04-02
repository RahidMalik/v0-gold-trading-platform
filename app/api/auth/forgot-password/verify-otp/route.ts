import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const { email, otp } = await req.json();

        const user = await prisma.user.findUnique({ where: { email } });

        if (
            !user ||
            user.resetOtp !== otp ||
            !user.resetOtpExpiry ||
            user.resetOtpExpiry < new Date()
        ) {
            return NextResponse.json(
                { error: "Invalid or expired OTP code." },
                { status: 400 }
            );
        }

        return NextResponse.json({ message: "OTP Verified successfully." });

    } catch (error) {
        console.error("Verify OTP error:", error);
        return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 });
    }
}