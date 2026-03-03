const variants = {
  base: "px-4 py-2 bg-primary-600 text-primary-50 rounded-full text-lg font-semibold hover:bg-primary-500 hover:text-primary-100 transition-colors shadow-sm duration-300 m-6 shadow-primary-300 cursor-pointer capitalize",

  primary:
    "px-4 py-2 bg-transparent border-2 border-primary-600 text-primary-600 rounded-full text-lg font-semibold hover:bg-primary-600 hover:text-primary-100 transition-colors shadow-sm duration-300 m-6 shadow-primary-300 cursor-pointer",

  secondary:
    "px-4 py-2  text-primary-600 text-base font-normal  hover:text-primary-400 transition-colors duration-300 m-6 s cursor-pointer",

  accent:
    "px-4 py-2 bg-accent-500 text-accent-50 rounded-full text-lg font-semibold hover:bg-accent-400 hover:text-accent-800 transition-colors shadow-sm duration-300 m-6 shadow-primary-300 cursor-pointer capitalize",

  reversed:
    "px-4 py-2 bg-transparent border-2 border-accent-600 text-accent-600 rounded-full text-lg font-semibold hover:bg-accent-600 hover:text-accent-100 transition-colors shadow-sm duration-300 m-6 shadow-primary-300 cursor-pointer",
};

export default function Button({
  children,
  variant = "base",
  onClick,
  type = "button",
}) {
  return (
    <button type={type} onClick={onClick} className={variants[variant]}>
      {children}
    </button>
  );
}
