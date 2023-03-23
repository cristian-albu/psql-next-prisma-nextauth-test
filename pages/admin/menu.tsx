import React, { useState, MouseEvent, ChangeEvent, FormEvent } from "react";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";
import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  InferGetStaticPropsType,
  NextPage,
} from "next";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import prisma from "@/lib/prisma";

export type MenuFormData = {
  name: string;
  description: string;
  price: number;
  ingredients: string;
  image: string;
};

const Menu: NextPage = ({
  menuList,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [imageSrc, setImageSrc] = useState<string | ArrayBuffer | null>(null);

  const [formData, setFormData] = useState<MenuFormData>({
    name: "",
    description: "",
    price: 0,
    ingredients: "",
    image: "",
  });

  function handleOnChange(changeEvent: ChangeEvent<HTMLFormElement>) {
    const reader = new FileReader();

    reader.onload = function (onLoadEvent) {
      if (onLoadEvent.target) {
        setImageSrc(onLoadEvent.target.result);
      }
    };

    reader.readAsDataURL(changeEvent.target.files[0]);
  }

  async function handleOnSubmit(event: FormEvent<any>) {
    event.preventDefault();

    const form = event.currentTarget;

    const fileInput: unknown = Array.from(form.elements).find(
      ({ name }: any) => name === "file"
    );

    if (
      fileInput instanceof HTMLInputElement &&
      fileInput.type === "file" &&
      fileInput.files
    ) {
      const formDataInside = new FormData();

      formDataInside.append("file", fileInput.files[0]);

      formDataInside.append("upload_preset", "yyoxrbq2");

      const data = await fetch(
        `https://api.cloudinary.com/v1_1/duwmlblke/image/upload`,
        {
          method: "POST",
          body: formDataInside,
        }
      ).then((r) => r.json());

      console.log(data.secure_url);

      if (typeof data.secure_url === "string") {
        setFormData({
          ...formData,
          image: data.secure_url,
        });
      }
    }
  }

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      formData.name.length > 5 &&
      formData.description.length > 10 &&
      formData.image.length > 20 &&
      formData.price > 0 &&
      formData.ingredients.length > 10
    ) {
      console.log("✅", JSON.stringify(formData));
    } else {
      console.log("Wrooong");
    }

    const res = await axios.post("/api/admin/create-menu-item", {
      formData,
    });

    console.log(res);
  };

  return (
    <div className="w-full h-[100vh] flex items-center justify-center max-w-[1200px] mx-auto flex-wrap">
      <div className="w-full">
        {menuList.map((item: any) => (
          <div key={item.id}>
            {item.name}{" "}
            <Image
              src={item.image}
              width={50}
              height={50}
              alt=""
              className="h-auto w-[50]"
            />
          </div>
        ))}
      </div>
      <form className="w-[60%] flex flex-col pr-10" onSubmit={handleFormSubmit}>
        <p>Name</p>
        <input
          type="text"
          className="border-2 border-gray-300 p-1 mb-5"
          value={formData.name}
          onChange={({ target }) =>
            setFormData({ ...formData, name: target.value })
          }
        />
        <p>description</p>
        <textarea
          className="border-2 border-gray-300 p-1 mb-5"
          value={formData.description}
          onChange={({ target }) =>
            setFormData({ ...formData, description: target.value })
          }
        />
        <p>price</p>
        <input
          type="number"
          className="border-2 border-gray-300 p-1 mb-5"
          value={formData.price}
          onChange={({ target }) =>
            setFormData({ ...formData, price: Number(target.value) })
          }
        />
        <p>{`Ingredients (separated by ";")`}</p>
        <textarea
          className="border-2 border-gray-300 p-1 mb-5"
          value={formData.ingredients}
          onChange={({ target }) =>
            setFormData({ ...formData, ingredients: target.value })
          }
        />
        <button type="submit">Submit</button>
      </form>
      <form
        className="border-2 border-gray-200 border-dashed p-5 flex flex-col items-center w-[40%]"
        name="form"
        onChange={handleOnChange}
        onSubmit={handleOnSubmit}
        method="post"
      >
        <input type="file" name="file" />
        {typeof imageSrc === "string" && (
          <Image
            width={300}
            height={300}
            alt=""
            src={imageSrc}
            className="w-[300px] h-[300px] object-contain"
          />
        )}
        {imageSrc && <button>Upload Files</button>}
      </form>
    </div>
  );
};

export default Menu;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const menuList = await prisma.menu.findMany();

  return {
    props: {
      session,
      menuList,
    },
  };
};
