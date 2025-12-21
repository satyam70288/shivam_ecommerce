// pages/checkout/address/new.jsx
import AddressForm from "@/components/checkout/AddressForm";
import { useNavigate } from "react-router-dom";

const NewAddressPage = () => {
  const navigate = useNavigate();

  return (
    <AddressForm
      isModal={false}
      onClose={() => navigate(-1)} // Back button पर previous page
    />
  );
};