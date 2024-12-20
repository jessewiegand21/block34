const express = require("express");
const app = express();

const {
  client,
  createTables,
  createCustomer,
  createRestaurant,
  fetchCustomers,
  fetchRestaurants,
  createReservation,
  fetchReservations,
  destroyReservation,
} = require("./db");

app.get("api/customers", async (req, res, next) => {
  try {
    res.send(await fetchCustomers());
  } catch (error) {
    next(ex);
  }
});
app.get("api/restaurants", async (req, res, next) => {
  try {
    res.send(await fetchRestaurants());
  } catch (error) {
    next(ex);
  }
});
app.get("api/reservations", async (req, res, next) => {
  try {
    res.send(await fetchReservations());
  } catch (error) {
    next(ex);
  }
});
app.post("api/customers/:id/reservations", async (req, res, next) => {
  try {
    res.status(201).send(
      await createReservation({
        customer_id: req.params.customer_id,
        restaurant_id: req.body.restaurant_id,
        reservation_date: req.body.reservation_date,
      })
    );
  } catch (error) {
    next(ex);
  }
});
app.delete(
  "api/customers/:costomer_id/reservations/:id",
  async (req, res, next) => {
    try {
      await destroyReservation({
        customer_id: req.params.customer_id,
        id: req.params.id,
      });
      res.sendStatus(204);
    } catch (error) {
      next(ex);
    }
  }
);

app.use((err, req, res, next) => {
  res.status(err.status || 500).send({ error: err.message || err });
});

const init = async () => {
  console.log("connecting to database");
  await client.connect();
  console.log("connected to database");
  await createTables();
  console.log("created tables");
  const [Jesse, Cheyenne, Alicia, Jay, Alya, McDonalds, Outback, Elways] =
    await Promise.all([
      createCustomer({ name: "Jesse" }),
      createCustomer({ name: "Cheyenne" }),
      createCustomer({ name: "Alicia" }),
      createCustomer({ name: "Jay" }),
      createCustomer({ name: "Alya" }),
      createRestaurant({ name: "McDonalds" }),
      createRestaurant({ name: "Outback" }),
      createRestaurant({ name: "Elways" }),
    ]);

  const reservation = await Promise.all([
    createReservation({
      customer_id: Jesse.id,
      restaurant_id: Elways.id,
      reservation_date: "05/16/2025",
      party_count: 10,
    }),
  ]);

  await destroyReservation({
    id: reservation.id,
    customer_id: reservation.customer_id,
  });

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`listening on port ${port}`);
  });
  await destroyReservation({
    id: reservation.id,
    customer_id: reservation.customer_id,
  });
};
init();
