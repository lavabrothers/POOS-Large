import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../data/stock_list.dart';
import '../services/alter_fav.dart';
import 'home_page.dart';

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
  final TextEditingController _controller = TextEditingController();

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

    for (var stock in stockList) {
      final label = '${stock['symbol']} (${stock['name']})';
      if (label == input) {
        matchedSymbol = stock['symbol']!;
        break;
      }
    }

    setState(() {
      logo = matchedSymbol;
    });
  }

  Future<void> addFavorite() async {
    final input = _controller.text;

    if (input.isEmpty) {
      setState(() => message = 'Select an option from the menu to add.');
      return;
    }

    String symbol = '';
    String companyName = '';
    for (var stock in stockList) {
      final label = '${stock['symbol']} (${stock['name']})';
      if (label == input) {
        symbol = stock['symbol']!;
        companyName = stock['name']!;
        break;
      }
    }

    if (symbol.isEmpty) {
      setState(() => message = 'Invalid stock selection.');
    } else {
      final success = await alterFav('a', user['_id'], symbol);
      setState(() {
        message = success
            ? 'Added $companyName to your favorites. Feel free to add more!'
            : 'Failed to add.';
        _controller.clear();
        logo = 'question';
      });
    }
  }

  void clearInput() {
    _controller.clear();
    setState(() {
      logo = 'question';
      message = '';
    });
  }

  void goToHome() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => const HomePage()),
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
            Autocomplete<String>(
              optionsBuilder: (TextEditingValue textEditingValue) {
                if (textEditingValue.text == '') return const Iterable<String>.empty();
                return stockList
                    .map((stock) => '${stock['symbol']} (${stock['name']})')
                    .where((option) =>
                    option.toLowerCase().contains(textEditingValue.text.toLowerCase()));
              },
              onSelected: (selection) {
                _controller.text = selection;
                onStockInputChanged(selection);
              },
              fieldViewBuilder: (context, controller, focusNode, onEditingComplete) {
                _controller.text = controller.text;
                return TextField(
                  controller: _controller,
                  focusNode: focusNode,
                  decoration: const InputDecoration(labelText: 'Search Stocks'),
                  onChanged: onStockInputChanged,
                );
              },
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
