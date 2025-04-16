
const LoadingThreedot = ({loading}:{loading:boolean}) => {
  return (
    <div className="flex items-start gap-3 w-full">
        <div className="flex gap-1 w-full justify-between px-2 py-1">
          <div className={`h-1 w-1 bg-current ${loading ? "rounded-full animate-bounce" : ""}`} />
          <div className={`h-1 w-1 bg-current ${loading ? "rounded-full animate-bounce [animation-delay:0.2s]" : ""}`} />
          <div className={`h-1 w-1 bg-current ${loading ? "rounded-full animate-bounce [animation-delay:0.4s]" : ""}`} />
        </div>
    </div>

  )
}

export default LoadingThreedot;
