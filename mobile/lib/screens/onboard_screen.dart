import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../data/stock_list.dart';
import '../services/alter_fav.dart';
import '../screens/home_page.dart';

class OnBoardScreen extends StatefulWidget {
  const OnBoardScreen({super.key});

  @override
  State<OnBoardScreen> createState() => _OnBoardScreenState();
}

class _OnBoardScreenState extends State<OnBoardScreen> {
  late Map<String, dynamic> user;
  String logo = 'question';
  String message = '';
  String name = '';
  String selectedStock = '';
  final TextEditingController _controller = TextEditingController();

  // This will store the stock list excluding the added favorites
  List<Map<String, String>> availableStockList = List.from(stockList);

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  Future<void> _loadUserData() async {
    final prefs = await SharedPreferences.getInstance();
    final userData = prefs.getString('user_data');

    if (userData == null || userData.isEmpty) {
      if (mounted) {
        Navigator.pushReplacementNamed(context, '/');
      }
      return;
    }

    setState(() {
      user = jsonDecode(userData);
      name = user['firstName'] ?? '';
    });
  }

  void onStockInputChanged(String input) {
    String matchedSymbol = 'question';

    // Use the stockList from the imported file to find the selected stock
    for (var stock in availableStockList) {
      final label = '${stock['symbol']} (${stock['name']})';
      if (label == input) {
        matchedSymbol = stock['symbol']!;
        break;
      }
    }

    setState(() {
      logo = matchedSymbol;
      selectedStock = input; // Set the selected stock here
    });
  }

  Future<void> addFavorite() async {
    if (selectedStock.isEmpty) {
      setState(() => message = 'Select an option from the menu to add.');
      return;
    }

    String symbol = '';
    String companyName = '';
    for (var stock in availableStockList) {
      final label = '${stock['symbol']} (${stock['name']})';
      if (label == selectedStock) {
        symbol = stock['symbol']!;
        companyName = stock['name']!;
        break;
      }
    }

    if (symbol.isEmpty) {
      setState(() => message = 'Invalid stock selection.');
    } else {
      final success = await alterFav('a', user['_id'], symbol); // Calls alterFav function
      if (success) {
        setState(() {
          // Successfully added to favorites
          message = 'Added $companyName to your favorites. Feel free to add more!';
          // Remove the selected stock from the list
          availableStockList.removeWhere((stock) =>
          '${stock['symbol']} (${stock['name']})' == selectedStock);
          // Reset the input field and logo
          _controller.clear();
          logo = 'question';
          selectedStock = ''; // Reset the selected stock
        });
      } else {
        setState(() {
          message = 'Failed to add.';
        });
      }
    }
  }

  void clearInput() {
    _controller.clear();
    setState(() {
      logo = 'question';
      message = '';
      selectedStock = ''; // Reset the selected stock
    });
  }

  void goToHome() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => const HomePage()), // Ensure HomePage is imported and defined
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Welcome to Financial Stats, ${name.toUpperCase()}!')),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          children: [
            const Text(
              "Tell us what stocks you're interested in so we can add them to your dashboard!",
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            // Dropdown to select a stock
            DropdownButtonFormField<String>(
              decoration: const InputDecoration(labelText: 'Select a Stock'),
              value: selectedStock.isEmpty ? null : selectedStock,
              onChanged: (String? newValue) {
                setState(() {
                  selectedStock = newValue!;
                  onStockInputChanged(newValue);
                });
              },
              items: availableStockList.map((stock) {
                return DropdownMenuItem<String>(
                  value: '${stock['symbol']} (${stock['name']})',
                  child: Text(
                    '${stock['symbol']} (${stock['name']})',
                    style: const TextStyle(color: Colors.white), // Set text color to white
                  ),
                );
              }).toList(),
              dropdownColor: Colors.black, // Set dropdown background color to dark
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: addFavorite,
                    child: const Text('Add'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: OutlinedButton(
                    onPressed: clearInput,
                    child: const Text('Clear'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            Image.asset(
              'assets/logos/$logo.jpg',
              height: 64,
              width: 64,
              errorBuilder: (context, error, stackTrace) =>
              const Icon(Icons.image_not_supported, size: 64),
            ),
            const SizedBox(height: 10),
            Text(
              message,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const Spacer(),
            ElevatedButton(
              onPressed: goToHome,
              child: const Text('Proceed'),
            ),
          ],
        ),
      ),
    );
  }
}
