// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import axios, { AxiosError } from "axios";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
type Data = {
    name: string;
  };
  
  export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>,
  ) {
      if (req.method === 'GET') {
          try {
              const resp = await axios.get(String(process.env.BACK) + 'users/me?populate=role',{headers: {"Authorization":"Bearer " + req.cookies.bearer}})
              res.json(resp.data)
          } catch (error) {
            console.log(error)
              res.status(error.response.status).json({message:error.response.data.message})
          }
      }
  
  }
  
