"""
Django management command to clean up orphaned files in S3.

This command compares files in S3 with database references and deletes
files that are no longer used.

Usage:
    python manage.py cleanup_s3_orphans
    python manage.py cleanup_s3_orphans --dry-run
    python manage.py cleanup_s3_orphans --include-detached
    python manage.py cleanup_s3_orphans --include-defaults
    python manage.py cleanup_s3_orphans --delete --include-detached
"""

from django.core.management.base import BaseCommand
from django.core.management import CommandError
from apps.core.utils import find_orphaned_s3_files, delete_s3_files
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Cleans up orphaned files in S3 that are not referenced in the database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Simulate the cleanup without actually deleting files',
        )
        parser.add_argument(
            '--include-detached',
            action='store_true',
            help='Also consider detached files (soft-deleted) as orphaned',
        )
        parser.add_argument(
            '--include-defaults',
            action='store_true',
            help='Also consider default images as orphaned',
        )
        parser.add_argument(
            '--delete',
            action='store_true',
            help='Actually delete the orphaned files (overrides --dry-run)',
        )
        parser.add_argument(
            '--verbose',
            action='store_true',
            help='Show detailed output',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run'] and not options['delete']
        include_detached = options['include_detached']
        include_defaults = options['include_defaults']
        verbose = options['verbose']

        self.stdout.write(self.style.SUCCESS('Starting S3 cleanup process...'))
        self.stdout.write('')

        # Find orphaned files
        self.stdout.write('Scanning S3 and comparing with database...')
        try:
            orphaned_files, stats = find_orphaned_s3_files(
                include_detached=include_detached,
                include_defaults=include_defaults
            )
        except Exception as e:
            raise CommandError(f'Error finding orphaned files: {str(e)}')

        # Display statistics
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('=== Statistics ==='))
        self.stdout.write(f"Total files in S3: {stats['total_s3_files']}")
        self.stdout.write(f"Active files in DB: {stats['active_db_files']}")
        self.stdout.write(f"Detached files in DB: {stats['detached_db_files']}")
        self.stdout.write(f"Default files in DB: {stats['default_db_files']}")
        self.stdout.write('')
        self.stdout.write(self.style.WARNING(f"Orphaned files found: {stats['orphaned_files']}"))
        self.stdout.write('')

        if stats['orphaned_files'] == 0:
            self.stdout.write(self.style.SUCCESS('No orphaned files found. S3 is clean!'))
            return

        # Show orphaned files if verbose
        if verbose and orphaned_files:
            self.stdout.write(self.style.WARNING('Orphaned files:'))
            for file_path in sorted(orphaned_files):
                self.stdout.write(f"  - {file_path}")
            self.stdout.write('')

        # Delete or simulate deletion
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No files will be deleted'))
            self.stdout.write('')
            self.stdout.write(f"Would delete {len(orphaned_files)} orphaned files")
            self.stdout.write('')
            self.stdout.write('Run with --delete to actually delete these files')
        else:
            self.stdout.write(self.style.WARNING('DELETION MODE - Files will be permanently deleted'))
            self.stdout.write('')
            
            # Ask for confirmation if not in dry-run
            if not options.get('skip_confirmation', False):
                confirm = input(f'Are you sure you want to delete {len(orphaned_files)} files? (yes/no): ')
                if confirm.lower() != 'yes':
                    self.stdout.write(self.style.ERROR('Operation cancelled.'))
                    return

            try:
                results = delete_s3_files(orphaned_files, dry_run=False)
                
                self.stdout.write('')
                self.stdout.write(self.style.SUCCESS('=== Deletion Results ==='))
                self.stdout.write(f"Successfully deleted: {results['success']}")
                self.stdout.write(f"Failed to delete: {results['failed']}")
                
                if results['errors'] and verbose:
                    self.stdout.write('')
                    self.stdout.write(self.style.ERROR('Errors:'))
                    for error in results['errors'][:10]:  # Show first 10 errors
                        self.stdout.write(f"  - {error}")
                    if len(results['errors']) > 10:
                        self.stdout.write(f"  ... and {len(results['errors']) - 10} more errors")
                
                self.stdout.write('')
                self.stdout.write(self.style.SUCCESS('Cleanup completed!'))
                
            except Exception as e:
                raise CommandError(f'Error deleting files: {str(e)}')

