import { useDispatch } from "react-redux";
import { useToast } from "./use-toast";
import { setUserLogout } from "@/redux/slices/authSlice";

const useErrorLogout = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const handleErrorLogout = (error, otherTitle = "Error occured") => {
    if (!error?.response) {
      toast({
        title: otherTitle,
        description: error?.message || "Something went wrong",
        variant: "destructive",
      });
      return;
    }
    if (error.response.status === 401) {
      dispatch(setUserLogout());
      toast({
        title: "Session expired",
        description: "Please login again to continue",
        variant: "destructive",
      });
    } else {
      toast({
        title: otherTitle,
        description: error.response.data.message,
        variant: "destructive",
      });
    }
  };

  return { handleErrorLogout };
};

export default useErrorLogout;
