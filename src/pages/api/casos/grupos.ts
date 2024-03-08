// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import axios, { AxiosError } from "axios";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
    if (req.method === 'GET') {
        try {
            const resp = await axios.get(String(process.env.BACK) + 'grupo-preguntas',{headers: {"Authorization":"Bearer " + req.cookies.bearer}})
            return res.json(resp.data.data)

        } catch (error) {
            res.status(error.response.status).json({message:error.response.data.message})
        }
    }

}
