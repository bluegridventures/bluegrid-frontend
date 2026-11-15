export default function Header({ workspace, children }) {
  return (
    <header className="flex min-h-[62px] items-center gap-[22px] bg-header px-[clamp(16px,3.7vw,66px)] text-white max-sm:gap-2.5">
      <span className="flex items-center gap-[9px] text-[22px] font-bold tracking-[-1px]">
        <i
          aria-hidden="true"
          className="block h-[21px] w-[21px] bg-[#76d4ac]"
          style={{
            backgroundImage:
              'linear-gradient(90deg,transparent 43%,#142e3c 43% 57%,transparent 57%),linear-gradient(transparent 43%,#142e3c 43% 57%,transparent 57%)',
          }}
        />
        Bluegrid
      </span>
      <span className="border-l border-[#59707c] pl-5 text-[#d4e2e7] max-sm:hidden">{workspace}</span>
      <div className="ml-auto flex items-center gap-2.5">{children}</div>
    </header>
  );
}

export function Avatar({ initials }) {
  return (
    <span className="grid h-[33px] w-[33px] place-items-center rounded-full bg-[#ccebcf] font-bold text-[#164b3d] max-sm:hidden">
      {initials}
    </span>
  );
}
