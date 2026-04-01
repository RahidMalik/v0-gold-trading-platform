import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const { email, otp } = await req.json();

        // 1. Database se user nikalain
        const user = await prisma.user.findUnique({ where: { email } });

        // 2. Check karein ke OTP sahi hai aur expire to nahi hua (5 mins limit)
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

        // 3. Agar sab theek hai, to Success message bhejein
        return NextResponse.json({ message: "OTP Verified successfully." });

    } catch (error) {
        console.error("Verify OTP error:", error);
        return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 });
    }
}