
interface props {
    message: string;
    action?: () => void;
  }
  export default function WarningAlert(props: props) {
    return (
        <div className="flex flex-row justify-center mb-6 mt-3">
        <div className="rounded-3xl	bg-[#FFF9E1] border-2 border-[#FFE476] flex items-center flex-row md:pt-4  md:pr-6  md:pb-6 md:pl-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-20 h-20 md:w-12 md:h-12"
            viewBox="0 0 32 32"
            fill="none"
          >
            <path
              d="M5.96 28H26.04C28.0933 28 29.3733 25.7734 28.3467 24L18.3067 6.65336C17.28 4.88003 14.72 4.88003 13.6933 6.65336L3.65333 24C2.62667 25.7734 3.90667 28 5.96 28ZM16 18.6667C15.2667 18.6667 14.6667 18.0667 14.6667 17.3334V14.6667C14.6667 13.9334 15.2667 13.3334 16 13.3334C16.7333 13.3334 17.3333 13.9334 17.3333 14.6667V17.3334C17.3333 18.0667 16.7333 18.6667 16 18.6667ZM17.3333 24H14.6667V21.3334H17.3333V24Z"
              fill="#FF7E00"
            />
          </svg>
          <span className=" mx-4 text-sm text-left md:text-base font-bold">
            {props.message}
          </span>
        </div>
        </div>
    );
  }
  