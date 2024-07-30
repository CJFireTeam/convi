interface props {
    message: string;
    action?: () => void;
  }
  export default function ErrorAlert(props: props) {
    return (
      <div className="flex flex-row justify-center mt-3">
        <div className="rounded-3xl	bg-[#FADAE6] border-2 border-[#FCA9C8] flex items-center flex-row md:pt-2  md:pr-6  md:pb-2 md:pl-4">
          <div className="m-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-12 h-12 md:w-12 md:h-12"
              viewBox="0 0 32 32"
              fill="none"
            >
              <path
                d="M16.0001 2.66663C8.64008 2.66663 2.66675 8.63996 2.66675 16C2.66675 23.36 8.64008 29.3333 16.0001 29.3333C23.3601 29.3333 29.3334 23.36 29.3334 16C29.3334 8.63996 23.3601 2.66663 16.0001 2.66663ZM16.0001 17.3333C15.2667 17.3333 14.6667 16.7333 14.6667 16V10.6666C14.6667 9.93329 15.2667 9.33329 16.0001 9.33329C16.7334 9.33329 17.3334 9.93329 17.3334 10.6666V16C17.3334 16.7333 16.7334 17.3333 16.0001 17.3333ZM17.3334 22.6666H14.6667V20H17.3334V22.6666Z"
                fill="#CB014A"
              />
            </svg>
          </div>
          <div className="flex flex-col justify-start">
          <span className=" mx-4 text-sm text-left md:text-base font-bold my-4 md:my-0">
            {props.message}
          </span>
          {props.action && <a onClick={props.action} className="mx-4 text-sm text-left md:text-base my-4 md:my-0 md:mt-3">Volver</a>}
        </div>
  
          </div>
      </div>
    );
  }
  