import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Image,
  Input,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import { utils as ethersUtils } from 'ethers';
import { Alchemy, Network, Utils } from 'alchemy-sdk';
import { useState } from 'react';

function App() {
  const [userAddress, setUserAddress] = useState('');
  const [queryState, setQueryState] = useState({
    status: 'idle',
    tokens: [],
    error: '',
  });

  async function getTokenBalance() {
    const address = userAddress.trim();

    if (!ethersUtils.isAddress(address)) {
      setQueryState({
        status: 'error',
        tokens: [],
        error: 'Enter a valid Ethereum address.',
      });
      return;
    }

    const apiKey = import.meta.env.VITE_ALCHEMY_API_KEY?.trim();
    if (!apiKey) {
      setQueryState({
        status: 'error',
        tokens: [],
        error: 'Alchemy API key is missing. Set VITE_ALCHEMY_API_KEY in .env.',
      });
      return;
    }

    setQueryState({ status: 'loading', tokens: [], error: '' });

    try {
      const alchemy = new Alchemy({
        apiKey,
        network: Network.ETH_MAINNET,
      });
      const tokens = [];
      let pageKey;

      do {
        const page = await alchemy.core.getTokensForOwner(
          address,
          pageKey ? { pageKey } : undefined
        );
        tokens.push(...page.tokens);
        pageKey = page.pageKey;
      } while (pageKey);

      setQueryState({ status: 'success', tokens, error: '' });
    } catch (error) {
      setQueryState({
        status: 'error',
        tokens: [],
        error:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred while loading token balances.',
      });
    }
  }

  return (
    <Box w="100%">
      <Center>
        <Flex
          alignItems={'center'}
          justifyContent="center"
          flexDirection={'column'}
        >
          <Heading mb={0} fontSize={36}>
            ERC-20 Token Indexer
          </Heading>
          <Text>
            Plug in an address and this website will return all of its ERC-20
            token balances!
          </Text>
        </Flex>
      </Center>
      <Flex
        w="100%"
        flexDirection="column"
        alignItems="center"
        justifyContent={'center'}
      >
        <Heading mt={42}>
          Get all the ERC-20 token balances of this address:
        </Heading>
        <Input
          aria-label="Ethereum address"
          onChange={(e) => setUserAddress(e.target.value)}
          value={userAddress}
          color="black"
          w="min(600px, 90vw)"
          textAlign="center"
          p={4}
          bgColor="white"
          fontSize={24}
          placeholder="0x..."
          isDisabled={queryState.status === 'loading'}
        />
        <Button
          fontSize={20}
          onClick={getTokenBalance}
          mt={36}
          bgColor="blue"
          isLoading={queryState.status === 'loading'}
          loadingText="Loading balances"
        >
          Check ERC-20 Token Balances
        </Button>

        <Heading my={36}>ERC-20 token balances:</Heading>

        {queryState.status === 'idle' && (
          <Text>Please enter an address and run a query.</Text>
        )}

        {queryState.status === 'error' && (
          <Text role="alert" color="red.300">
            {queryState.error}
          </Text>
        )}

        {queryState.status === 'success' &&
          (queryState.tokens.length === 0 ? (
            <Text>No ERC-20 token balances found.</Text>
          ) : (
            <SimpleGrid
              w="90vw"
              columns={{ base: 1, sm: 2, lg: 4 }}
              spacing={6}
            >
              {queryState.tokens.map((token) => {
                const formattedBalance =
                  !token.error &&
                  token.rawBalance !== undefined &&
                  Number.isInteger(token.decimals)
                    ? Utils.formatUnits(token.rawBalance, token.decimals)
                    : null;

                return (
                  <Flex
                    flexDir="column"
                    color="white"
                    bg="blue"
                    w="100%"
                    minW={0}
                    p={4}
                    key={token.contractAddress}
                  >
                    <Box overflowWrap="anywhere">
                      <b>Token:</b>{' '}
                      {token.symbol || token.name || token.contractAddress}
                    </Box>
                    <Box overflowWrap="anywhere">
                      <b>Balance:</b> {formattedBalance ?? 'Unavailable'}
                    </Box>
                    {token.error && (
                      <Text role="status" overflowWrap="anywhere">
                        Token data unavailable: {token.error}
                      </Text>
                    )}
                    {token.logo && (
                      <Image
                        src={token.logo}
                        alt={`${token.symbol || 'Token'} logo`}
                        maxH="100px"
                        objectFit="contain"
                      />
                    )}
                  </Flex>
                );
              })}
            </SimpleGrid>
          ))}
      </Flex>
    </Box>
  );
}

export default App;
