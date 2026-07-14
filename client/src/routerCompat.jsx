"use client";

import NextLink from "next/link";
import {
  notFound,
  useParams as useNextParams,
  usePathname,
  useRouter,
  useSearchParams as useNextSearchParams,
} from "next/navigation";
import { useEffect, useMemo } from "react";

export function Link({ to, href, replace: _replace, ...props }) {
  return <NextLink href={href ?? to ?? "#"} {...props} />;
}

export function useNavigate() {
  const router = useRouter();

  return (to, options = {}) => {
    if (typeof to === "number") {
      if (to === -1) router.back();
      return;
    }

    if (options.replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  };
}

export function useParams() {
  return useNextParams();
}

export function useLocation() {
  const pathname = usePathname();
  const searchParams = useNextSearchParams();
  const search = searchParams.toString();

  return {
    pathname,
    search: search ? `?${search}` : "",
  };
}

export function useSearchParams() {
  const router = useRouter();
  const pathname = usePathname();
  const nextSearchParams = useNextSearchParams();

  const params = useMemo(
    () => new URLSearchParams(nextSearchParams.toString()),
    [nextSearchParams]
  );

  const setSearchParams = (nextParams) => {
    const query =
      nextParams instanceof URLSearchParams
        ? nextParams.toString()
        : new URLSearchParams(nextParams).toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return [params, setSearchParams];
}

export function Navigate({ to, replace = false }) {
  const router = useRouter();

  useEffect(() => {
    if (replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  }, [replace, router, to]);

  return null;
}

export function Outlet() {
  return null;
}

export { notFound };
