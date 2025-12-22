import { useQuery } from "@tanstack/react-query";
import { getWaitlistCount } from "@/actions/waitlist";

type UseWaitlistCountOptions = {
	initialData?: number;
};

export const useWaitlistCount = (options?: UseWaitlistCountOptions) => {
	return useQuery({
		queryKey: ["waitlist-count"],
		queryFn: getWaitlistCount,
		initialData: options?.initialData,
	});
};
