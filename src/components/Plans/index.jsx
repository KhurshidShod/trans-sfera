import React from "react";
import styles from "./Plans.module.css";
import { plans } from "../../assets/data/data";

const Plans = () => {
  return (
    <section>
      <div className="container">
        <div className={styles.plans}>
          <div className={styles.plans_header}>
            <h1>Наши тарифы</h1>
            <span></span>
          </div>
          <div className={styles.plans_wrapper}>
            {plans.map((plan, index) => (
              <div className={styles.plan} key={index}>
                <h2>{plan.name}</h2>
                <div className={styles.plan_image}>
                  <img src={plan.image} alt="" />
                </div>
                <div className={styles.plan_info}>
                  <b>{plan.cars.join(", ")} <span>{plan.price} ₽/km</span></b>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Plans;
