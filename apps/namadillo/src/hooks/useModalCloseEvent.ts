import { useLocation, useNavigate } from "react-router-dom";

type useModalCloseEventProps = {
  onCloseModal: () => void;
};

export const useModalCloseEvent = (): useModalCloseEventProps => {
  const navigate = useNavigate();
  const location = useLocation();

  const onCloseModal = (): void => {
    if (location.state?.backgroundLocation) {
      navigate((location.state.backgroundLocation as Location).pathname, {
        replace: true,
      });
    } else {
      navigate("/", { replace: true });
    }
  };

  return { onCloseModal };
};
