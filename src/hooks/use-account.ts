import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";

import { accountQueryOptions, notificationsQueryOptions } from "@/lib/account";
import { profileDetailsQueryOptions } from "@/lib/profile-data";

export function useCurrentUser() {
  return useRouteContext({ from: "/_authenticated" }).user;
}

export function useAccount() {
  const user = useCurrentUser();
  const { data } = useSuspenseQuery(accountQueryOptions(user.id));
  return { user, ...data };
}

export function useNotifications() {
  const user = useCurrentUser();
  return useQuery(notificationsQueryOptions(user.id));
}

export function useProfileDetails() {
  const user = useCurrentUser();
  return useSuspenseQuery(profileDetailsQueryOptions(user.id)).data;
}
