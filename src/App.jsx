import {
  Alert,
  AlertDescription,
  AlertIcon,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Container,
  Flex,
  HStack,
  Heading,
  Image,
  Input,
  InputGroup,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  VStack,
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
    resolvedAddress: '',
    resolvedName: '',
  });

  async function getTokenBalance() {
    const input = userAddress.trim();

    if (!input) {
      setQueryState({
        status: 'error',
        tokens: [],
        error: 'Enter an Ethereum address or ENS name.',
        resolvedAddress: '',
        resolvedName: '',
      });
      return;
    }

    const apiKey = import.meta.env.VITE_ALCHEMY_API_KEY?.trim();
    if (!apiKey) {
      setQueryState({
        status: 'error',
        tokens: [],
        error: 'Alchemy API key is missing. Set VITE_ALCHEMY_API_KEY in .env.',
        resolvedAddress: '',
        resolvedName: '',
      });
      return;
    }

    setQueryState({
      status: 'loading',
      tokens: [],
      error: '',
      resolvedAddress: '',
      resolvedName: '',
    });

    try {
      const alchemy = new Alchemy({
        apiKey,
        network: Network.ETH_MAINNET,
      });
      let address = input;
      let resolvedName = '';

      if (!ethersUtils.isAddress(input)) {
        address = await alchemy.core.resolveName(input);
        if (!address) {
          throw new Error(
            `ENS name "${input}" did not resolve to an Ethereum address.`
          );
        }
        resolvedName = input;
      }
      if (!ethersUtils.isAddress(address)) {
        throw new Error(
          'The input did not resolve to a valid Ethereum address.'
        );
      }

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

      setQueryState({
        status: 'success',
        tokens,
        error: '',
        resolvedAddress: address,
        resolvedName,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred while loading token balances.';

      setQueryState({
        status: 'error',
        tokens: [],
        error: errorMessage.split(apiKey).join('[redacted]'),
        resolvedAddress: '',
        resolvedName: '',
      });
    }
  }

  return (
    <Box
      minH="100vh"
      bg="#080D19"
      color="gray.100"
      position="relative"
      overflow="hidden"
    >
      <Box
        aria-hidden="true"
        position="absolute"
        top="-260px"
        right="-180px"
        boxSize={{ base: '360px', md: '620px' }}
        borderRadius="full"
        bg="teal.400"
        opacity={0.08}
        filter="blur(120px)"
        pointerEvents="none"
      />
      <Container maxW="7xl" position="relative" py={{ base: 6, md: 10 }}>
        <Flex as="header" align="center" justify="space-between" gap={4}>
          <HStack spacing={3}>
            <Flex
              boxSize={11}
              align="center"
              justify="center"
              borderRadius="xl"
              bgGradient="linear(to-br, teal.200, cyan.500)"
              boxShadow="0 8px 30px rgba(45, 212, 191, 0.2)"
            >
              <Box
                display="grid"
                gridTemplateColumns="repeat(2, 1fr)"
                gap="1.5"
              >
                <Box boxSize={2} borderRadius="full" bg="gray.900" />
                <Box boxSize={2} borderRadius="full" bg="gray.900" />
                <Box boxSize={2} borderRadius="full" bg="gray.900" />
                <Box boxSize={2} borderRadius="full" bg="gray.900" />
              </Box>
            </Flex>
            <Stack spacing={0}>
              <Text fontWeight="bold" letterSpacing="tight">
                ERC20 <Text as="span" color="teal.200">INDEXER</Text>
              </Text>
              <Text fontSize="xs" color="gray.500">
                Read-only token explorer
              </Text>
            </Stack>
          </HStack>
          <Badge
            px={3}
            py={2}
            borderRadius="full"
            color="teal.100"
            bg="whiteAlpha.100"
            border="1px solid"
            borderColor="whiteAlpha.200"
          >
            <HStack spacing={2}>
              <Box boxSize={2} borderRadius="full" bg="teal.300" />
              <Text as="span">ETHEREUM MAINNET</Text>
            </HStack>
          </Badge>
        </Flex>

        <Stack as="main" spacing={{ base: 10, md: 14 }} mt={{ base: 14, md: 20 }}>
          <Stack align="center" textAlign="center" spacing={5}>
            <Badge
              px={3}
              py={1.5}
              borderRadius="full"
              color="teal.100"
              bg="teal.900"
              letterSpacing="0.12em"
            >
              YOUR ON-CHAIN PORTFOLIO
            </Badge>
            <Heading
              as="h1"
              maxW="4xl"
              fontSize={{ base: '4xl', md: '6xl' }}
              lineHeight={1.05}
              letterSpacing="-0.045em"
            >
              Explore your{' '}
              <Text as="span" color="teal.200">
                ERC-20
              </Text>{' '}
              balances.
            </Heading>
            <Text maxW="2xl" color="gray.400" fontSize={{ base: 'md', md: 'lg' }}>
              A clear view of the tokens held by any Ethereum address. No
              connection or transaction required.
            </Text>
          </Stack>

          <Card
            maxW="3xl"
            w="100%"
            mx="auto"
            bg="rgba(15, 23, 42, 0.78)"
            border="1px solid"
            borderColor="whiteAlpha.200"
            borderRadius="2xl"
            boxShadow="0 24px 80px rgba(0, 0, 0, 0.28)"
            backdropFilter="blur(18px)"
          >
            <CardBody p={{ base: 5, md: 8 }}>
              <Stack spacing={5}>
                <Flex align="start" justify="space-between" gap={4}>
                  <Stack spacing={1}>
                    <Heading as="h2" size="md">
                      Look up a wallet
                    </Heading>
                    <Text color="gray.400" fontSize="sm">
                      Enter an Ethereum address or ENS name.
                    </Text>
                  </Stack>
                  <Badge colorScheme="teal" variant="subtle" borderRadius="full">
                    MAINNET
                  </Badge>
                </Flex>
                <Flex direction={{ base: 'column', sm: 'row' }} gap={3}>
                  <InputGroup size="lg" flex="1">
                    <Input
                      aria-label="Ethereum address or ENS name"
                      onChange={(e) => setUserAddress(e.target.value)}
                      value={userAddress}
                      placeholder="Address or name.eth"
                      isDisabled={queryState.status === 'loading'}
                      bg="whiteAlpha.50"
                      borderColor="whiteAlpha.200"
                      borderRadius="xl"
                      _hover={{ borderColor: 'whiteAlpha.400' }}
                      _focusVisible={{
                        borderColor: 'teal.300',
                        boxShadow: '0 0 0 1px var(--chakra-colors-teal-300)',
                      }}
                      _placeholder={{ color: 'gray.600' }}
                    />
                  </InputGroup>
                  <Button
                    size="lg"
                    colorScheme="teal"
                    borderRadius="xl"
                    px={7}
                    onClick={getTokenBalance}
                    isLoading={queryState.status === 'loading'}
                    loadingText="Scanning"
                    flexShrink={0}
                  >
                    Check balances
                  </Button>
                </Flex>
                <HStack spacing={2} color="gray.500" fontSize="xs">
                  <Text color="teal.300" aria-hidden="true">
                    ●
                  </Text>
                  <Text>
                    Addresses and ENS names are sent to Alchemy for lookup and
                    are not persisted by this app.
                  </Text>
                </HStack>
              </Stack>
            </CardBody>
          </Card>

          <Stack spacing={5}>
            <Flex
              align={{ base: 'start', sm: 'center' }}
              justify="space-between"
              direction={{ base: 'column', sm: 'row' }}
              gap={3}
            >
              <Stack spacing={1}>
                <Heading as="h2" size="lg">
                  Token portfolio
                </Heading>
                <Text color="gray.500" fontSize="sm">
                  {queryState.status === 'success'
                    ? 'Your on-chain ERC-20 holdings'
                    : 'Results will appear here after a lookup'}
                </Text>
                {queryState.status === 'success' &&
                  queryState.resolvedName && (
                    <Text color="gray.500" fontSize="xs">
                      {queryState.resolvedName} resolves to{' '}
                      <Text as="span" color="teal.200" fontFamily="mono">
                        {queryState.resolvedAddress}
                      </Text>
                    </Text>
                  )}
              </Stack>
              <Badge
                px={3}
                py={1.5}
                borderRadius="full"
                colorScheme={
                  queryState.status === 'error'
                    ? 'red'
                    : queryState.status === 'loading'
                      ? 'yellow'
                      : 'gray'
                }
                variant="subtle"
              >
                {queryState.status === 'loading'
                  ? 'SCANNING WALLET'
                  : queryState.status === 'error'
                    ? 'QUERY FAILED'
                    : queryState.status === 'success'
                      ? `${queryState.tokens.length} TOKENS`
                      : 'AWAITING ADDRESS'}
              </Badge>
            </Flex>

            {queryState.status === 'error' && (
              <Alert
                status="error"
                borderRadius="xl"
                bg="red.900"
                border="1px solid"
                borderColor="red.700"
              >
                <AlertIcon />
                <AlertDescription>{queryState.error}</AlertDescription>
              </Alert>
            )}

            {queryState.status === 'loading' && (
              <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
                {Array.from({ length: 6 }, (_, index) => (
                  <Skeleton
                    key={index}
                    height="172px"
                    borderRadius="2xl"
                    startColor="gray.800"
                    endColor="gray.700"
                  />
                ))}
              </SimpleGrid>
            )}

            {queryState.status === 'idle' && (
              <Card
                bg="whiteAlpha.50"
                border="1px solid"
                borderColor="whiteAlpha.100"
                borderRadius="2xl"
              >
                <CardBody py={10}>
                  <VStack spacing={3}>
                    <Flex
                      boxSize={12}
                      align="center"
                      justify="center"
                      borderRadius="2xl"
                      bg="whiteAlpha.100"
                      color="teal.200"
                      fontSize="2xl"
                      aria-hidden="true"
                    >
                      ◈
                    </Flex>
                    <Text fontWeight="semibold">Ready when you are</Text>
                    <Text color="gray.500" fontSize="sm" textAlign="center">
                      Add an address above to see its ERC-20 tokens.
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            )}

            {queryState.status === 'success' &&
              (queryState.tokens.length === 0 ? (
                <Card
                  bg="whiteAlpha.50"
                  border="1px solid"
                  borderColor="whiteAlpha.100"
                  borderRadius="2xl"
                >
                  <CardBody py={10}>
                    <VStack spacing={2}>
                      <Text fontWeight="semibold">No tokens found</Text>
                      <Text color="gray.500" fontSize="sm" textAlign="center">
                        This address has no ERC-20 balances to show on Ethereum
                        Mainnet.
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
                  {queryState.tokens.map((token) => {
                    const formattedBalance =
                      !token.error &&
                      token.rawBalance !== undefined &&
                      Number.isInteger(token.decimals)
                        ? Utils.formatUnits(token.rawBalance, token.decimals)
                        : null;
                    const tokenLabel =
                      token.symbol || token.name || token.contractAddress;

                    return (
                      <Card
                        key={token.contractAddress}
                        bg="rgba(15, 23, 42, 0.72)"
                        border="1px solid"
                        borderColor="whiteAlpha.100"
                        borderRadius="2xl"
                        transition="all 180ms ease"
                        _hover={{
                          transform: 'translateY(-3px)',
                          borderColor: 'teal.700',
                          boxShadow: '0 18px 40px rgba(0, 0, 0, 0.2)',
                        }}
                      >
                        <CardBody p={5}>
                          <Stack spacing={5}>
                            <HStack align="start" justify="space-between">
                              <HStack minW={0} spacing={3}>
                                <Flex
                                  boxSize={12}
                                  flexShrink={0}
                                  align="center"
                                  justify="center"
                                  borderRadius="xl"
                                  bg="teal.900"
                                  color="teal.200"
                                  overflow="hidden"
                                  fontWeight="bold"
                                >
                                  {token.logo ? (
                                    <Image
                                      src={token.logo}
                                      alt={`${tokenLabel} logo`}
                                      boxSize={12}
                                      objectFit="cover"
                                    />
                                  ) : (
                                    tokenLabel.slice(0, 1).toUpperCase()
                                  )}
                                </Flex>
                                <Stack spacing={0.5} minW={0}>
                                  <Text
                                    fontWeight="semibold"
                                    noOfLines={1}
                                    title={tokenLabel}
                                  >
                                    {tokenLabel}
                                  </Text>
                                  <Text
                                    color="gray.500"
                                    fontSize="xs"
                                    noOfLines={1}
                                    title={token.contractAddress}
                                  >
                                    {token.contractAddress}
                                  </Text>
                                </Stack>
                              </HStack>
                              <Badge
                                flexShrink={0}
                                colorScheme="teal"
                                variant="subtle"
                                borderRadius="full"
                              >
                                ERC-20
                              </Badge>
                            </HStack>

                            <Stack spacing={1}>
                              <Text
                                color="gray.500"
                                fontSize="xs"
                                fontWeight="medium"
                                letterSpacing="0.1em"
                              >
                                TOKEN BALANCE
                              </Text>
                              <Text
                                fontSize={{ base: 'xl', md: '2xl' }}
                                fontWeight="semibold"
                                fontVariantNumeric="tabular-nums"
                                overflowWrap="anywhere"
                              >
                                {formattedBalance ?? 'Unavailable'}
                              </Text>
                              {token.error && (
                                <Text color="orange.300" fontSize="xs">
                                  Token data unavailable: {token.error}
                                </Text>
                              )}
                            </Stack>

                            <Flex
                              pt={3}
                              borderTop="1px solid"
                              borderColor="whiteAlpha.100"
                              justify="space-between"
                              align="center"
                            >
                              <Text color="gray.500" fontSize="xs">
                                Ethereum Mainnet
                              </Text>
                              <Text color="gray.500" fontSize="xs">
                                {Number.isInteger(token.decimals)
                                  ? `${token.decimals} decimals`
                                  : 'Decimals unavailable'}
                              </Text>
                            </Flex>
                          </Stack>
                        </CardBody>
                      </Card>
                    );
                  })}
                </SimpleGrid>
              ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

export default App;
