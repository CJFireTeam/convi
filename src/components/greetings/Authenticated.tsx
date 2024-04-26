import { useUserStore } from "../../store/userStore";

export default function Greetings_Authenticated () {
    const { bearer, setRole, GetRole, user, isLoading } = useUserStore();
    return (
        <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow">
        <div className="px-4 py-3 sm:px-6">
          <h6 className="font-bold md:text-lg text-sm">Hola {user.firstname} {user.first_lastname}, estos son los casos que has creado</h6>
        </div>
    </div>
    )
}