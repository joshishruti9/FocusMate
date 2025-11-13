import axios from 'axios';

export async function addReward(userEmail: string, points: number): Promise<void> {
  const userServiceUrl = process.env.USER_SERVICE_URL || 'http://user-service:5002/users/rewards/add';
  try {
    await axios.post(userServiceUrl, { userEmail, points });
  } catch (err) {
    console.error('userClient.addReward failed:', (err as any).message || err);
    throw err;
  }
}
