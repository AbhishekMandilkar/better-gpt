import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { joinWaitlist } from "@/actions/waitlist";

export const useJoinWaitlist = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: joinWaitlist,
		onSuccess: (result) => {
			if (result.success) {
				toast.success(result.message);
				queryClient.invalidateQueries({ queryKey: ["waitlist-count"] });
			} else {
				toast.error(result.message);
			}
		},
		onError: () => {
			toast.error("Something went wrong. Please try again.");
		},
	});
};
