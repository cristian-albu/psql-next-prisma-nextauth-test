import { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";
import { MenuFormData } from "@/pages/admin/menu";
import prisma from "@/lib/prisma";

export const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.status(401).json({ data: null, error: "You must be logged in." });
    return;
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({
      data: null,
      error: "Method Not Allowed",
    });
    return;
  }

  const data: MenuFormData = await req.body.formData;

  if (
    data.name.length > 2 &&
    data.description.length > 2 &&
    data.ingredients.length > 2 &&
    data.image.length > 2 &&
    data.price > 0
  ) {
    try {
      const menuItem = await prisma.menu.create({ data: data });

      res.status(200).json({ menuItem });
    } catch (error) {
      console.log(error);
      return res
        .status(400)
        .json({ data: null, error: `There was a problem ${error}` });
    }
  }
};

export default handler;
