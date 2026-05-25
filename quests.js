export const questTemplates = {
  daily: [
    {
      id: "daily1",
      name: "Spot 5 biler",
      goal: 5,
      reward: 50
    },
    {
      id: "daily2",
      name: "Spot 10 biler",
      goal: 10,
      reward: 100
    }
  ],

  weekly: [
    {
      id: "weekly1",
      name: "Spot 50 biler",
      goal: 50,
      reward: 500
    }
  ]
};

export const questPool = {
  daily: [
    {
      id: "d1",
      name: "Spot et skilt med DL",
      goal: 1,
      type: "hasDL",
      reward: 80
    },
    {
      id: "d2",
      name: "Spot et skilt der summen av tall = 18",
      goal: 1,
      type: "sumEquals",
      value: 18,
      reward: 120
    },
    {
      id: "d3",
      name: "Spot et skilt med dobbel bokstav",
      goal: 1,
      type: "doubleLetters",
      reward: 100
    }
  ]
};
