export const questPool = {
  daily: [
    {
      id: "d1",
      name: "Spot et skilt med DL",
      type: "hasText",
      value: "DL",
      goal: 1,
      reward: 80
    },

    {
      id: "d2",
      name: "Summen av tall = 18",
      type: "sumEquals",
      value: 18,
      goal: 1,
      reward: 120
    },

    {
      id: "d3",
      name: "Spot et skilt med dobbel bokstav",
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
    }
  ]
};
