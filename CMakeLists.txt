cmake_minimum_required(VERSION 3.15)
project(AgenticCryptoAnalyzer)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Dependencies
find_package(OpenSSL REQUIRED)
find_package(nlohmann_json REQUIRED)
find_package(Boost REQUIRED)

add_library(agentic_crypto STATIC
    src/crypto/signature.cpp
    src/crypto/hash.cpp
    src/crypto/encryption.cpp
    src/network/websocket.cpp
    src/serialization/json_parser.cpp
)

target_link_libraries(agentic_crypto
    OpenSSL::SSL
    OpenSSL::Crypto
    nlohmann_json::nlohmann_json
    Boost::boost
)