import pool from './connect';

export async function getUsers() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT * FROM users');
    return res.rows;
  } finally {
    client.release();
  }
}

export async function getPosts() {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM "Post"'); 
      // Note the quotes - important if your table has capital letters
      console.log(res.rows,"res")
      return res.rows;
    } finally {
      client.release();
    }
  }