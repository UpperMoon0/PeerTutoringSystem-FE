import WithdrawalForm from '@/components/tutor/WithdrawalForm';
import { Card, CardContent } from '@/components/ui/card';

const TutorWithdrawPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Create Withdraw Request</h1>
      <Card>
        <CardContent className="pt-6">
          <WithdrawalForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default TutorWithdrawPage;