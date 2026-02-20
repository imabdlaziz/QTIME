const startGame = () => {
  if (!country || !language || !teamA || !teamB) {
    alert("عبّ كل البيانات");
    return;
  }

  router.push({
    pathname: "/game/categories",
    query: {
      country,
      language,
      teamA,
      teamB
    }
  });
};
