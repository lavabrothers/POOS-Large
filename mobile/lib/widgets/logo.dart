import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';

class Logo extends StatelessWidget {
  const Logo({super.key});

  void goToHomePage(BuildContext context) {
    Navigator.pushNamed(context, '/home');
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Top row: Lottie + Title
        Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            GestureDetector(
              onTap: () => goToHomePage(context),
              child: Lottie.asset(
                'assets/graph_animation.json',
                height: 100,
              ),
            ),
            GestureDetector(
              onTap: () => goToHomePage(context),
              child: Padding(
                padding: const EdgeInsets.only(top: 16.0),
                child: Text(
                  'Finstats',
                  style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                    fontSize: 42,
                  ),
                ),
              ),
            ),
          ],
        ),

        const SizedBox(height: 10),

        // Placeholder for future search bar
        Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: const [
            // You can place a search bar here
          ],
        ),
      ],
    );
  }
}
