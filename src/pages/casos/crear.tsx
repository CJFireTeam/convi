import Cookies from "js-cookie";
import { useRouter } from "next/router";
import axios from "axios";
import Layout from "../../components/layout/Layout";
import { useEffect, useState } from "react";

interface CardProps {
  content: {
    attributes: {
      Titulo: string
    }
  }; // Tipo de contenido, ajusta según tus necesidades
}

const Card: React.FC<CardProps> = ({ content }) => {
  return (
    <div
      className={`rounded-lg bg-white shadow opacity 0 animate-fadein text-black`}
    >
      <div className="px-4 py-5 sm:p-6">{content.attributes.Titulo}</div>
    </div>
  );
};

export default function CrearCasos() {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await await axios.get(
          process.env.NEXT_PUBLIC_BACKEND_URL + "api/casos/grupos"
        );
        setData(response.data);
      } catch (error) {
        console.error(error);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="flex flex-row space-x-4">
      {data.map((item, index) => (
        <div key={index}>
          <Card content={item} />
        </div>
      ))}
    </div>
  );
}
