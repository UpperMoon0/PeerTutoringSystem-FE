import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookingService } from '@/services/BookingService';

interface ProofOfPaymentUploaderProps {
  bookingId: string;
  onUploadSuccess: (filePath: string) => void;
}

const ProofOfPaymentUploader: React.FC<ProofOfPaymentUploaderProps> = ({ bookingId, onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const result = await BookingService.uploadProofOfPayment(bookingId, file);
      if (result.success && result.data) {
        onUploadSuccess(result.data.filePath);
      } else {
        setError(result.error?.message || 'Failed to upload proof of payment.');
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'An unexpected error occurred.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Proof of Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="proof-of-payment">Proof of Payment Image</Label>
            <Input id="proof-of-payment" type="file" onChange={handleFileChange} />
          </div>
          <Button onClick={handleUpload} disabled={uploading || !file}>
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
          {error && <p className="text-red-500">{error}</p>}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProofOfPaymentUploader;