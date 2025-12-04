import axios from 'axios';

export async function addReward(id: string, userEmail: string, points: number): Promise<void> {
  const userServiceUrl = 'https://users-service-b9bbb4csb2fjhdhg.centralus-01.azurewebsites.net/api/users/rewards';
  try {
    console.log(`Adding reward: id=${id}, userEmail=${userEmail}, points=${points}`);
    await axios.post(userServiceUrl, {userEmail, points });
  } catch (err) {
    console.error('userClient.addReward failed:', (err as any).message || err);
    throw err;
  }
}
