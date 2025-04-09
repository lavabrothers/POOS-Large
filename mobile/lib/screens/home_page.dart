import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../data/stock_list.dart';
import '../services/alter_fav.dart';
import '../widgets/stock_card.dart';
import 'login_screen.dart';
import 'favorites_page.dart';
import 'stock_info_page.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  List<Map<String, String>> stocks = [];
  List<Map<String, String>> filteredStocks = [];
  bool loading = true;
  String? error;
  String? addError;
  String? name;
  late String userId;
  String searchQuery = '';

  int currentPage = 0;
  final int itemsPerPage = 4;

  final ScrollController _scrollController = ScrollController();
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    initUserAndFetchStocks();
  }

  Future<void> goToFavorites() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const FavoritesPage()),
    );
    if (result == true) {
      await fetchStocksAndFavorites();
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('user_data');
    if (mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
    }
  }

  void goToStockInfoPage(String symbol) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => StockInfoPage(symbol: symbol),
      ),
    );
  }

  void goBackToLogin() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => const LoginScreen()),
    );
  }

  Future<void> initUserAndFetchStocks() async {
    final prefs = await SharedPreferences.getInstance();
    final userString = prefs.getString('user_data') ?? '';

    if (userString.isEmpty) {
      goBackToLogin();
      return;
    }

    try {
      final user = jsonDecode(userString);
      name = user['firstName'];
      userId = user['_id'];
      await fetchStocksAndFavorites();
    } catch (e) {
      setState(() {
        error = "Failed to parse user data.";
        loading = false;
      });
    }
  }

  Future<String> fetchStockName(String symbol) async {
    try {
      final nameResponse = await http.get(Uri.parse(
          'http://134.122.3.46:3000/api/stockInfo?ticker=$symbol'));
      if (nameResponse.statusCode == 200) {
        final info = jsonDecode(nameResponse.body);
        return info['short name']?.toString() ?? '';
      }
    } catch (_) {}
    return '';
  }

  Future<void> fetchStocksAndFavorites() async {
    try {
      final stocksResponse =
      await http.get(Uri.parse('http://134.122.3.46:3000/api/stocks'));

      if (stocksResponse.statusCode != 200) {
        throw Exception("Stocks API error: ${stocksResponse.statusCode}");
      }

      final stocksData =
      List<Map<String, dynamic>>.from(jsonDecode(stocksResponse.body));

      final favResponse = await http.get(Uri.parse(
          'http://134.122.3.46:3000/api/favorites/search?userId=$userId'));

      Set<String> favoriteSymbols = {};

      if (favResponse.statusCode == 200) {
        final favData = jsonDecode(favResponse.body);
        favoriteSymbols = Set<String>.from(
          favData['stocks'].map((fav) => fav['symbol']),
        );
      }

      final List<Map<String, String>> temp = [];
      for (var stock in stocksData) {
        if (!favoriteSymbols.contains(stock['symbol'])) {
          String symbol = stock['symbol'].toString();
          String displayName = stock['name']?.toString() ?? '';

          if (displayName.isEmpty) {
            displayName = await fetchStockName(symbol);
          }

          temp.add({'symbol': symbol, 'name': displayName});
        }
      }

      setState(() {
        stocks = temp;
        filteredStocks = temp;
        loading = false;
      });
    } catch (e) {
      setState(() {
        error = "Error fetching stocks: ${e.toString()}";
        loading = false;
      });
    }
  }

  Future<void> addStockFromSearch() async {
    try {
      final response = await http.get(
        Uri.parse('http://134.122.3.46:3000/api/stocks/${searchQuery.trim()}'),
      );

      if (response.statusCode == 200) {
        final nameResponse = await http.get(
          Uri.parse('http://134.122.3.46:3000/api/stockInfo?ticker=${searchQuery.trim()}'),
        );
        final nameData = jsonDecode(nameResponse.body);
        final shortName = nameData['short name'] ?? '';

        final Map<String, String> newStock = {
          'symbol': searchQuery.trim().toUpperCase(),
          'name': shortName,
        };

        setState(() {
          stocks.add(newStock);
          filterStocks(searchQuery); // Refresh display
        });
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Stock not found or API limit reached.')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error adding stock.')),
      );
    }
  }

  void filterStocks(String query) {
    final lowerQuery = query.toLowerCase();
    setState(() {
      searchQuery = query;
      currentPage = 0;
      filteredStocks = stocks.where((stock) {
        final symbol = stock['symbol']?.toLowerCase() ?? '';
        final name = stock['name']?.toLowerCase() ?? '';
        return symbol.contains(lowerQuery) || name.contains(lowerQuery);
      }).toList();
    });
  }

  Future<void> addFavorite(Map<String, String> stock) async {
    setState(() {
      addError = null;
    });

    final success = await alterFav('a', userId, stock['symbol'] ?? '');

    if (success) {
      setState(() {
        stocks.removeWhere((s) => s['symbol'] == stock['symbol']);
        filteredStocks.removeWhere((s) => s['symbol'] == stock['symbol']);
      });
    } else {
      setState(() {
        addError = "Error adding favorite.";
      });
    }
  }

  void _changePage(int newPage) {
    setState(() {
      currentPage = newPage;
    });

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _scrollController.animateTo(
        0,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (error != null) {
      return Scaffold(
        appBar: AppBar(title: const Text("Home Page")),
        body: Center(child: Text(error!)),
      );
    }

    final totalPages = (filteredStocks.length / itemsPerPage).ceil();
    final currentStocks = filteredStocks
        .skip(currentPage * itemsPerPage)
        .take(itemsPerPage)
        .toList();

    return Scaffold(
      appBar: AppBar(
        title: Text("Welcome, $name!"),
        actions: [
          IconButton(
            onPressed: goToFavorites,
            icon: const Icon(Icons.star),
            tooltip: 'Favorites',
          ),
          IconButton(
            onPressed: logout,
            icon: const Icon(Icons.logout),
            tooltip: 'Logout',
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            TextField(
              controller: _searchController,
              style: const TextStyle(color: Colors.white), // White text color
              decoration: InputDecoration(
                hintText: 'Search for a stock symbol or name...',
                hintStyle: const TextStyle(color: Colors.white60), // Light white hint text
                prefixIcon: const Icon(Icons.search, color: Colors.white),
                suffixIcon: IconButton(
                  icon: const Icon(Icons.add, color: Colors.white),
                  onPressed: addStockFromSearch,
                ),
                filled: true,
                fillColor: Colors.black, // Dark background color for input field
                border: const OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.white38),
                ),
                enabledBorder: const OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.white38),
                ),
                focusedBorder: const OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.white),
                ),
              ),
              onChanged: filterStocks,
            ),
            const SizedBox(height: 12),
            if (addError != null)
              Text(addError!, style: const TextStyle(color: Colors.red)),
            Expanded(
              child: currentStocks.isNotEmpty
                  ? ListView.builder(
                controller: _scrollController,
                itemCount: currentStocks.length,
                itemBuilder: (context, index) {
                  final stock = currentStocks[index];
                  return StockCard(
                    symbol: stock['symbol']!,
                    name: stock['name'],
                    onAddFavorite: () => addFavorite(stock),
                    onSymbolClick: () =>
                        goToStockInfoPage(stock['symbol']!),
                  );
                },
              )
                  : const Center(
                child: Text("No stocks match your search."),
              ),
            ),
            if (totalPages > 1)
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  TextButton(
                    onPressed: currentPage > 0
                        ? () => _changePage(currentPage - 1)
                        : null,
                    child: const Text("Previous"),
                  ),
                  Text("Page ${currentPage + 1} of $totalPages"),
                  TextButton(
                    onPressed: currentPage < totalPages - 1
                        ? () => _changePage(currentPage + 1)
                        : null,
                    child: const Text("Next"),
                  ),
                ],
              )
          ],
        ),
      ),
    );
  }
}
