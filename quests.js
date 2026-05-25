export const questPool = {
  daily: [
    {
      id: "d1",
      name: "Spot 5 biler",
      type: "countCars",
      goal: 5,
      reward: 50
    },
    {
      id: "d2",
      name: "Spot 10 biler",
      type: "countCars",
      goal: 10,
      reward: 100
    },
    {
      id: "d3",
      name: "Skilt inneholder DL",
      type: "hasText",
      value: "DL",
      goal: 1,
      reward: 80
    },
    {
      id: "d4",
      name: "Summen av tall = 18",
      type: "sumEquals",
      value: 18,
      goal: 1,
      reward: 120
    },
    {
      id: "d5",
      name: "Dobbel bokstav i skilt",
      type: "doubleLetter",
      goal: 1,
      reward: 100
    }
  ],

  weekly: [
    {
      id: "w1",
      name: "Spot 50 biler",
      type: "countCars",
      goal: 50,
      reward: 500
    },
    {
      id: "w2",
      name: "Spot 3 DL-skilt",
      type: "hasText",
      value: "DL",
      goal: 3,
      reward: 250
    }
  ]
};
