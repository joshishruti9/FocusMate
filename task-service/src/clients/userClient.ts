import axios from 'axios';

export async function addReward(id: string, userEmail: string, points: number): Promise<void> {
  const userServiceUrl = 'http://localhost:4000/api/users/rewards';
  try {
    console.log(`Adding reward: id=${id}, userEmail=${userEmail}, points=${points}`);
    await axios.post(userServiceUrl, {userEmail, points });
  } catch (err) {
    console.error('userClient.addReward failed:', (err as any).message || err);
    throw err;
  }
}
