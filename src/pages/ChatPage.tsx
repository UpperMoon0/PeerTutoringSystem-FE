import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ChatPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-6 space-y-6">
      <Card className="bg-gray-900 border-gray-800 shadow-xl flex flex-col h-[calc(100vh-8rem)]">
        <CardHeader className="p-6 border-b border-gray-800">
          <CardTitle className="text-2xl text-white">Chat</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Chat messages will go here */}
          <div className="flex justify-start">
            <div className="bg-blue-600 text-white p-3 rounded-lg max-w-xs shadow-md">
              Hello! How can I help you today?
            </div>
          </div>
          <div className="flex justify-end">
            <div className="bg-gray-700 text-white p-3 rounded-lg max-w-xs shadow-md">
              Hi, I have a question about my tutoring session.
            </div>
          </div>
          <div className="flex justify-start">
            <div className="bg-blue-600 text-white p-3 rounded-lg max-w-xs shadow-md">
              Sure, please tell me more.
            </div>
          </div>
        </CardContent>
        <div className="p-6 border-t border-gray-800 flex items-center space-x-3">
          <Input 
            placeholder="Type your message..." 
            className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500" 
          />
          <Button 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 text-base"
          >
            Send
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ChatPage;