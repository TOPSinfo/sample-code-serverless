export const userDelete = (client, user_id) => {
  const deleteUser = await client.query(
    `DELETE FROM users WHERE user_id=$1`,
    [data.user_id]
  );
  return deleteUser
};


export const getUser = (client, user_id) => {
  const users = await client.query(`SELECT * FROM users WHERE user_id=$1`, [
    user_id
  ]);
  return users
};



export const updateVisitedScreen = (client, user_id) => {
  const lastScreen = await client.query(
    `UPDATE users SET last_visited_screen=($1) WHERE user_id=($2)`,
    [data.last_visited_screen, data.user_id]
  );

  return lastScreen
};
