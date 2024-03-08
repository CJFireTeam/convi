// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import axios, { AxiosError } from "axios";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
    if (req.method === 'POST') {
        try {
            const resp = await axios.post(String(process.env.BACK) + 'auth/local',req.body)
            return res.json(resp.data)

        } catch (error) {
            res.status(error.response.status).json({message:error.response.data.message})
        }
    }

}
