from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from items.models import Item, Claim
from notifications.models import Notification
from datetime import date, timedelta

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds initial database with administrative account, demo users, and sample lost & found items'

    def handle(self, *args, **options):
        self.stdout.write("Seeding database...")

        # 1. Create Superuser / Admin
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@lostandfound.com',
                'full_name': 'Administrator',
                'phone_number': '+1-800-555-0100',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            admin_user.set_password('AdminPass123!')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS("Created admin user (admin / AdminPass123!)"))
        else:
            self.stdout.write("Admin user already exists.")

        # 2. Create Demo User 1
        user1, created = User.objects.get_or_create(
            username='alex_turner',
            defaults={
                'email': 'alex.turner@campus.edu',
                'full_name': 'Alex Turner',
                'phone_number': '+1-555-0123',
                'bio': 'Senior Computer Science major. Frequently around Central Science Library.'
            }
        )
        if created:
            user1.set_password('Password123!')
            user1.save()
            self.stdout.write(self.style.SUCCESS("Created user alex_turner (Password123!)"))

        # 3. Create Demo User 2
        user2, created = User.objects.get_or_create(
            username='sarah_connor',
            defaults={
                'email': 'sarah.c@cityworks.org',
                'full_name': 'Sarah Connor',
                'phone_number': '+1-555-0189',
                'bio': 'Campus facilities coordinator & active community volunteer.'
            }
        )
        if created:
            user2.set_password('Password123!')
            user2.save()
            self.stdout.write(self.style.SUCCESS("Created user sarah_connor (Password123!)"))

        # Sample Items Data
        today = date.today()
        sample_items = [
            {
                'title': 'Blue Leather Bellroy Wallet',
                'item_type': 'lost',
                'category': 'Wallets',
                'description': 'Slim navy blue leather wallet. Contains driver license and credit cards. Lost between the student center and parking lot B.',
                'location': 'Student Center Main Plaza',
                'date_lost_or_found': today - timedelta(days=2),
                'contact_email': 'alex.turner@campus.edu',
                'contact_phone': '+1-555-0123',
                'status': 'active',
                'user': user1,
            },
            {
                'title': 'Apple AirPods Pro (2nd Gen) in White Case',
                'item_type': 'found',
                'category': 'Electronics',
                'description': 'Found under desk row 3 in lecture hall 102. Case has a small green dinosaur sticker on the back.',
                'location': 'Science Building, Hall 102',
                'date_lost_or_found': today - timedelta(days=1),
                'contact_email': 'sarah.c@cityworks.org',
                'contact_phone': '+1-555-0189',
                'status': 'active',
                'user': user2,
            },
            {
                'title': 'Black The North Face Borealis Backpack',
                'item_type': 'lost',
                'category': 'Bags',
                'description': 'Lost black backpack containing spiral notebooks, graphing calculator TI-84, and insulated steel water bottle.',
                'location': 'Campus Recreation Center Locker Room',
                'date_lost_or_found': today - timedelta(days=3),
                'contact_email': 'alex.turner@campus.edu',
                'contact_phone': '+1-555-0123',
                'status': 'active',
                'user': user1,
            },
            {
                'title': 'Subaru Car Key with Blue braided Lanyard',
                'item_type': 'found',
                'category': 'Keys',
                'description': 'Car key fob with two small brass locker keys attached to a blue woven rope keychain. Handed over to security desk.',
                'location': 'North Parking Garage Level 2',
                'date_lost_or_found': today - timedelta(days=4),
                'contact_email': 'sarah.c@cityworks.org',
                'contact_phone': '+1-555-0189',
                'status': 'active',
                'user': user2,
            },
            {
                'title': 'Silver Seiko Kinetic Wrist Watch',
                'item_type': 'lost',
                'category': 'Jewellery',
                'description': 'Classic stainless steel watch with dark blue dial and roman numerals. Sentimental value gift from family.',
                'location': 'University Library Quiet Floor (4th Floor)',
                'date_lost_or_found': today - timedelta(days=5),
                'contact_email': 'alex.turner@campus.edu',
                'contact_phone': '+1-555-0123',
                'status': 'active',
                'user': user1,
            },
            {
                'title': 'Organic Chemistry 9th Edition Hardcover',
                'item_type': 'found',
                'category': 'Books',
                'description': 'Large Wade & Simek textbook found in the cafeteria booth after lunch hour. Has highlighter marks in chapters 4-6.',
                'location': 'Main Dining Hall, Booth 12',
                'date_lost_or_found': today - timedelta(days=2),
                'contact_email': 'sarah.c@cityworks.org',
                'contact_phone': '+1-555-0189',
                'status': 'active',
                'user': user2,
            },
            {
                'title': 'iPhone 14 (Midnight Black) in Clear Case',
                'item_type': 'found',
                'category': 'Mobile Phones',
                'description': 'Found on the bench outside the metro station exit. Screen lock shows notifications. Please provide phone unlock PIN or verification.',
                'location': 'Metro Station East Entrance',
                'date_lost_or_found': today - timedelta(days=1),
                'contact_email': 'sarah.c@cityworks.org',
                'contact_phone': '+1-555-0189',
                'status': 'active',
                'user': user2,
            },
            {
                'title': 'Black Leather Cardholder & State ID',
                'item_type': 'lost',
                'category': 'Documents',
                'description': 'Lost black cardholder containing State ID, Transit Pass, and student identification card.',
                'location': 'Bus Route 42 - Downtown Stop',
                'date_lost_or_found': today - timedelta(days=6),
                'contact_email': 'alex.turner@campus.edu',
                'contact_phone': '+1-555-0123',
                'status': 'resolved',
                'user': user1,
            },
        ]

        created_items = []
        for item_data in sample_items:
            item, created = Item.objects.get_or_create(
                title=item_data['title'],
                defaults=item_data
            )
            if created:
                created_items.append(item)

        self.stdout.write(self.style.SUCCESS(f"Populated {len(created_items)} items."))

        # Create a sample claim and notification
        if created_items and len(created_items) >= 2:
            found_phone = next((it for it in created_items if it.item_type == 'found' and 'AirPods' in it.title), None)
            if found_phone:
                claim, c_created = Claim.objects.get_or_create(
                    item=found_phone,
                    claimant=user1,
                    defaults={
                        'message': 'Hi Sarah! I lost my AirPods Pro in hall 102 yesterday. The green dinosaur sticker matches mine perfectly! How can I meet you to verify?',
                        'proof_details': 'Serial number in my Apple ID is H2XJ99410 and dinosaur sticker has a red hat.',
                        'contact_phone': '+1-555-0123',
                        'contact_email': 'alex.turner@campus.edu',
                        'status': 'pending'
                    }
                )
                if c_created:
                    Notification.objects.create(
                        recipient=found_phone.user,
                        sender=user1,
                        item=found_phone,
                        claim=claim,
                        title=f"New Claim Request for '{found_phone.title}'",
                        message=f"{user1.display_name} sent a claim for your found item '{found_phone.title}'.",
                        notification_type='claim_received'
                    )
                    self.stdout.write(self.style.SUCCESS("Created sample claim and notification."))

        self.stdout.write(self.style.SUCCESS("Database seeded successfully!"))
