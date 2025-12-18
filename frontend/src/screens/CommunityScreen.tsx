import React from 'react';
import { View, Text } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);

const CommunityScreen = () => {
  return (
    <StyledView className="flex-1 justify-center items-center bg-white">
      <StyledText className="text-xl font-bold text-emerald-800">Comunidad</StyledText>
      <StyledText className="text-gray-500">Conecta con otros materos</StyledText>
    </StyledView>
  );
};

export default CommunityScreen;
