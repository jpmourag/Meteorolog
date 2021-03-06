import { Carousel } from "../../layout/carousel/Carousel";

import { ForecastCardsContent } from "./ForecastCardsContent";
import "./style/style.scss";

export const ForecastCards = () => {
  return (
    <div>
      <h3> Weather Forecast </h3>
      <Carousel contentName="forecast" styleName="carousel">
        <ForecastCardsContent />
      </Carousel>
    </div>
  );
};
